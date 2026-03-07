import axios from "axios";
import { config } from "../../config/env";
import { FOOD_CATEGORIES } from "../../utils/categories";
import { mapFoodDetail } from "./foods.mapper";

const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export const searchFoods = async (query: string) => {

 const response = await axios.get(`${BASE_URL}/foods/search`, {
  params: {
   api_key: config.usdaApiKey,
   query,
   pageSize: 10
  }
 });

 return response.data.foods.map((food: any) => ({
  id: food.fdcId,
  name: food.description
 }));

};

export const getFoodById = async (id: string) => {

 const response = await axios.get(`${BASE_URL}/food/${id}`, {
  params: {
   api_key: config.usdaApiKey
  }
 });

 return mapFoodDetail(response.data);

};

export const getFoodsByCategory = async (category: string) => {

 const query = FOOD_CATEGORIES[category as keyof typeof FOOD_CATEGORIES];

 const response = await axios.get(`${BASE_URL}/foods/search`, {
  params: {
   api_key: config.usdaApiKey,
   query,
   pageSize: 10
  }
 });

 return response.data.foods.map((food: any) => ({
  id: food.fdcId,
  name: food.description
 }));

};