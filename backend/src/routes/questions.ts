import { Router, Request, Response } from "express";
import assessmentData from "../data/assessment.json" with { type: "json" };

const router = Router();
const data = assessmentData as any;

console.log(`✅ Assessment data loaded: ${data.personas.length} personas, ${Object.keys(data.dimensions).length} persona dimension sets`);

/**
 * GET /api/questions
 * Returns all assessment configuration data
 */
router.get("/", (_req: Request, res: Response) => {
    res.json(data);
});

/**
 * GET /api/questions/personas
 * Returns only the persona list
 */
router.get("/personas", (_req: Request, res: Response) => {
    res.json(data.personas);
});

/**
 * GET /api/questions/dimensions/:personaId
 * Returns dimensions for a specific persona
 */
router.get("/dimensions/:personaId", (req: Request, res: Response) => {
    const { personaId } = req.params;
    const dims = data.dimensions[personaId as string];
    if (!dims) {
        res.status(404).json({ error: `No dimensions found for persona: ${personaId}` });
        return;
    }
    res.json(dims);
});

/**
 * GET /api/questions/tiers
 * Returns tier definitions
 */
router.get("/tiers", (_req: Request, res: Response) => {
    res.json(data.tiers);
});

/**
 * GET /api/questions/industry-use-cases
 * Returns industry use cases map
 */
router.get("/industry-use-cases", (_req: Request, res: Response) => {
    res.json(data.industryUseCases);
});

/**
 * GET /api/questions/next-steps/:personaId/:score
 * Returns recommended next steps for a persona and score
 */
router.get("/next-steps/:personaId/:score", (req: Request, res: Response) => {
    const { personaId, score } = req.params;
    const scoreNum = parseInt(score as string, 10);
    const stepsTable = data.nextSteps[personaId as string];
    if (!stepsTable) {
        res.status(404).json({ error: `No next steps found for persona: ${personaId}` });
        return;
    }
    for (const t of [28, 21, 15, 0]) {
        if (scoreNum >= t) {
            res.json(stepsTable[String(t)] || []);
            return;
        }
    }
    res.json(stepsTable["0"] || []);
});

/**
 * GET /api/questions/tier-description/:personaId/:score
 * Returns the tier description for a persona and score
 */
router.get("/tier-description/:personaId/:score", (req: Request, res: Response) => {
    const { personaId, score } = req.params;
    const scoreNum = parseInt(score as string, 10);
    const descTable = data.tierDescriptions[personaId as string];
    if (!descTable) {
        res.status(404).json({ error: `No descriptions found for persona: ${personaId}` });
        return;
    }
    for (const t of [28, 21, 15, 0]) {
        if (scoreNum >= t) {
            res.json({ description: descTable[String(t)] || "" });
            return;
        }
    }
    res.json({ description: descTable["0"] || "" });
});

export default router;
