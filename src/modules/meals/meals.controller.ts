import { Request, Response } from "express";
import {
 createMeal,
 getMealsByUser,
 getMealsByDay,
 deleteMeal
} from "./meals.service";

export const createMealController = (req: Request, res: Response) => {

 const meal = createMeal(req.body);

 res.status(201).json(meal);

};

export const getMealsByUserController = (req: Request, res: Response) => {

 const userId = Number(req.params.userId);

 const meals = getMealsByUser(userId);

 res.json(meals);

};

export const getMealsByDayController = (req: Request, res: Response) => {

 const dayId = Number(req.params.dayId);

 const meals = getMealsByDay(dayId);

 res.json(meals);

};

export const deleteMealController = (req: Request, res: Response) => {

 const id = Number(req.params.id);

 const deleted = deleteMeal(id);

 if (!deleted) {
  return res.status(404).json({ error: "Meal not found" });
 }

 res.json({ message: "Meal deleted" });

};