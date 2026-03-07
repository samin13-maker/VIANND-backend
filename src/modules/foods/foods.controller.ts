import { Request, Response } from "express";
import { searchFoods, getFoodById, getFoodsByCategory } from "./foods.service";

export const searchFoodController = async (req: Request, res: Response) => {

 const { query } = req.query as { query: string };

 const foods = await searchFoods(query);

 res.json(foods);

};

export const getFoodController = async (req: Request, res: Response) => {

 const { id } = req.params as {id: string};

 const food = await getFoodById(id);

 res.json(food);

};

export const getCategoryController = async (req: Request, res: Response) => {

 const { category } = req.params as {category: string};

 const foods = await getFoodsByCategory(category);

 res.json(foods);

};