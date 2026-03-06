import { Router } from "express";
import { getTodayStatsController } from "../controllers/statsController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/today", authMiddleware, getTodayStatsController);

export default router;