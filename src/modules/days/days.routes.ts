import { Router } from "express";
import {
 createDayController,
 getDaysController,
 completeDayController
} from "./days.controller";

const router = Router();

router.post("/", createDayController);

router.get("/user/:userId", getDaysController);

router.patch("/:id/complete", completeDayController);

export default router;