import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import assessmentRoutes from "./routes/assessments.js";
import questionsRoutes from "./routes/questions.js";
import pdfRoutes from "./routes/pdf.js";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ── Middleware ──
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// ── Health check ──
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use("/api/questions", questionsRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/pdfs", express.static(path.join(process.cwd(), "public", "pdfs")));

// ── Start ──
app.listen(PORT, () => {
    console.log(`\n🚀 Scorecard API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
