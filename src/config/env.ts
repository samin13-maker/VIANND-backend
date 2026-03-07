import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  usdaApiKey: process.env.USDA_API_KEY
};