import { extractNutrients } from "../../utils/nutritionExtractor";

export const mapFoodDetail = (food: any) => {

 const nutrients = extractNutrients(food.foodNutrients);

 return {
  id: food.fdcId,
  name: food.description,
  ...nutrients
 };

};