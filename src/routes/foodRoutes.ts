import { Router } from "express";
import { searchFoodController, getFoodByIdController } from "../controllers/foodController";

const router = Router();

router.get("/search", searchFoodController);
router.get("/:id", getFoodByIdController);

export default router;