import { Router, Request, Response } from "express";
import { generatePdf } from "../services/puppeteer.js";

const router = Router();

// POST /api/pdf/generate — Generate a PDF of the assessment results
router.post("/generate", async (req: Request, res: Response) => {
    try {
        const { shareId } = req.body;

        if (!shareId) {
            res.status(400).json({ error: "shareId is required" });
            return;
        }

        const pdfBuffer = await generatePdf(shareId);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="agentforce-readiness-report-${shareId.slice(0, 8)}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

export default router;
