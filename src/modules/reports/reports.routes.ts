import { Router } from "express";
import { weeklyReportController } from "./reports.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/weekly/:userId", authMiddleware, weeklyReportController);

export default router;