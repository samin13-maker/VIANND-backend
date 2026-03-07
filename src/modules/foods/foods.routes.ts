import { Router } from "express";
import {
 searchFoodController,
 getFoodController,
 getCategoryController
} from "./foods.controller";

const router = Router();

router.get("/search", searchFoodController);

router.get("/:id", getFoodController);

router.get("/category/:category", getCategoryController);

export default router;