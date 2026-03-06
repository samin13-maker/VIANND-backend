import axios from "axios";
import { FDC_API_KEY } from "../config/env";

const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export const searchFood = async (query: string) => {

  const response = await axios.get(
    `${BASE_URL}/foods/search`,
    {
      params: {
        api_key: FDC_API_KEY,
        query: query,
        pageSize: 10
      }
    }
  );

  const foods = response.data.foods.map((food: any) => ({
    name: food.description,
    fdcId: food.fdcId
  }));

  return foods;
};

export const getFoodById = async (id: string) => {

  const response = await axios.get(
    `${BASE_URL}/food/${id}`,
    {
      params: {
        api_key: FDC_API_KEY
      }
    }
  );

  return response.data;
};