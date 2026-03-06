import { Router } from "express";
import {createLogController, getTodayLogsController} from "../controllers/logController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createLogController);
router.get("/today", authMiddleware, getTodayLogsController);

export default router;