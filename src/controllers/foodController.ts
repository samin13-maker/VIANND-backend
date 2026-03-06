import { Request, Response } from "express";
import { searchFood, getFoodById } from "../services/foodService";
import { extractNutrients } from "../utils/nutritionFilter";

// Buscar alimentos
export const searchFoodController = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Debes ingresar un alimento"
      });
    }

    const foods = await searchFood(query as string);

    res.json(foods);

  } catch (error) {
    res.status(500).json({
      message: "Error al buscar alimentos"
    });
  }
};


// Obtener alimento por ID y filtrar nutrientes
export const getFoodByIdController = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;

    const food = await getFoodById(id as string);

    const nutrients = extractNutrients(food.foodNutrients);

    const result = {
      name: food.description,
      ...nutrients
    };

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener alimento"
    });
  }
};