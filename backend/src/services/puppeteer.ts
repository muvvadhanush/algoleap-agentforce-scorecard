import puppeteer from "puppeteer";
import prisma from "../lib/db.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export async function generatePdf(shareId: string): Promise<Buffer> {
  // Verify the assessment exists
  const assessment = await prisma.assessment.findUnique({
    where: { shareId },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  // Generate an HTML report page
  const html = buildReportHtml(assessment);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Crucial for memory issues on Docker/Render
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

function buildReportHtml(assessment: any): string {
  const scores = typeof assessment.scores === "string"
    ? JSON.parse(assessment.scores)
    : assessment.scores;

  const dims = [
    "completeness", "accuracy", "connectivity",
    "identity", "semantic", "governance", "usecase"
  ];

  const dimLabels: Record<string, string> = {
    completeness: "Data Completeness",
    accuracy: "Data Accuracy",
    connectivity: "Connectivity & Integration",
    identity: "Identity Resolution",
    semantic: "Metadata & Semantics",
    governance: "Governance Maturity",
    usecase: "AI Use Case Clarity",
  };

  const dimRows = dims.map(d => {
    const s = scores[d] || 0;
    const pct = (s / 5) * 100;
    const color = s >= 4 ? "#2D7A3A" : s >= 3 ? "#D4930D" : "#C62828";
    return `
      <tr>
        <td style="padding: 10px 12px; font-size: 13px; font-weight: 600;">${dimLabels[d] || d}</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: ${color};">${s}/5</td>
        <td style="padding: 10px 12px; width: 200px;">
          <div style="height: 8px; background: #f0f0f0; border-radius: 4px;">
            <div style="height: 100%; width: ${pct}%; background: ${color}; border-radius: 4px;"></div>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #222; background: #fff; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2D5A27, #4A8C3F); padding: 28px 32px; border-radius: 12px; color: #fff; margin-bottom: 28px;">
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; margin-bottom: 8px;">
            Algoleap · Salesforce Practice
          </div>
          <div style="font-size: 24px; font-weight: 800;">Agentforce Readiness Report</div>
          <div style="font-size: 13px; opacity: 0.8; margin-top: 4px;">
            Prepared for ${assessment.firstName} ${assessment.lastName}
            ${assessment.company ? ` · ${assessment.company}` : ""}
          </div>
        </div>

        <!-- Score Card -->
        <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 28px; padding: 24px; background: #f7f9f6; border-radius: 12px;">
          <div style="text-align: center;">
            <div style="font-size: 48px; font-weight: 800; color: #2D5A27;">${assessment.score}</div>
            <div style="font-size: 12px; color: #888;">of 35</div>
          </div>
          <div>
            <div style="display: inline-block; padding: 5px 14px; border-radius: 16px; background: #E8F5E3; color: #2D5A27; font-weight: 700; font-size: 14px; margin-bottom: 6px;">
              ${assessment.tier}
            </div>
            <div style="font-size: 13px; color: #555;">
              Persona: ${assessment.persona.charAt(0).toUpperCase() + assessment.persona.slice(1)}
            </div>
          </div>
        </div>

        <!-- Dimension Table -->
        <div style="margin-bottom: 28px;">
          <div style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Dimension Breakdown</div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 8px;">
            <thead>
              <tr style="background: #fafafa;">
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #888;">Dimension</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #888;">Score</th>
                <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #888;">Progress</th>
              </tr>
            </thead>
            <tbody>
              ${dimRows}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #888; text-align: center;">
          <p>Generated by Algoleap · Agentforce Readiness Scorecard · algoleap.com</p>
          <p style="margin-top: 4px;">Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
