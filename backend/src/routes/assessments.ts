import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../lib/db.js";
import { generatePdf } from "../services/puppeteer.js";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const router = Router();

// POST /api/assessments — Submit a new assessment
router.post("/", async (req: Request, res: Response) => {
    try {
        const { user, persona, scores, totalScore, tier } = req.body;

        let assessment = await prisma.assessment.create({
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                company: user.company || null,
                jobTitle: user.jobTitle || null,
                phone: user.phone || null,
                persona,
                score: totalScore,
                tier,
                scores,
            },
        });

        // Generate the PDF synchronously before responding
        try {
            const pdfBuffer = await generatePdf(assessment.shareId);
            const pdfFileName = `${assessment.shareId}.pdf`;

            // Upload directly to Supabase Storage Bucket ('pdfs')
            const { data, error } = await supabase.storage
                .from("pdfs")
                .upload(pdfFileName, pdfBuffer, {
                    contentType: "application/pdf",
                    upsert: true,
                });

            if (error) {
                console.error("[Supabase Upload Error]", error);
                throw error;
            }

            // Get the permanently hosted public URL
            const { data: publicData } = supabase.storage
                .from("pdfs")
                .getPublicUrl(pdfFileName);
                
            const pdfUrl = publicData.publicUrl;

            // Update DB with the cloud URL
            assessment = await prisma.assessment.update({
                where: { id: assessment.id },
                data: { pdfUrl } as any,
            });
            console.log(`[PDF Generated] Uploaded to Supabase Storage: ${pdfUrl}`);
        } catch (pdfError) {
            console.error("[PDF Generation Error]", pdfError);
            // We continue even if PDF fails, so the user isn't completely blocked
        }

        res.json({
            id: assessment.id,
            shareId: assessment.shareId,
            score: assessment.score,
            tier: assessment.tier,
            pdfUrl: (assessment as any).pdfUrl,
        });
    } catch (error) {
        console.error("Error creating assessment:", error);
        res.status(500).json({ error: "Failed to save assessment" });
    }
});

// GET /api/assessments/:shareId — Get assessment by share ID
router.get("/:shareId", async (req: Request, res: Response) => {
    try {
        const assessment = await prisma.assessment.findUnique({
            where: { shareId: req.params.shareId as string },
        });

        if (!assessment) {
            res.status(404).json({ error: "Assessment not found" });
            return;
        }

        res.json(assessment);
    } catch (error) {
        console.error("Error fetching assessment:", error);
        res.status(500).json({ error: "Failed to fetch assessment" });
    }
});

export default router;
