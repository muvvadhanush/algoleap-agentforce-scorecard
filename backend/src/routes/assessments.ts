import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../lib/db.js";
import { generatePdf } from "../services/puppeteer.js";

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

            // Save PDF to local public folder (this logic will be swapped for Supabase Storage later)
            const pdfsDir = path.join(process.cwd(), "public", "pdfs");
            if (!fs.existsSync(pdfsDir)) {
                fs.mkdirSync(pdfsDir, { recursive: true });
            }
            const pdfFileName = `${assessment.shareId}.pdf`;
            fs.writeFileSync(path.join(pdfsDir, pdfFileName), pdfBuffer);

            // Update DB with the URL
            const pdfUrl = `/pdfs/${pdfFileName}`;
            assessment = await prisma.assessment.update({
                where: { id: assessment.id },
                data: { pdfUrl } as any,
            });
            console.log(`[PDF Generated] Saved to ${pdfUrl}`);
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
