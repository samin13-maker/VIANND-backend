import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const FDC_API_KEY = process.env.FDC_API_KEY || "";