import { pool } from "../../config/database";
import { WeeklyReport } from "./reports.types";

export const generateWeeklyReport = async (userId: number): Promise<WeeklyReport> => {
  const result = await pool.query(
    `SELECT
       ROUND(AVG(
         (SELECT COALESCE(SUM(a.calorias * ra.cantidad / 100), 0)
          FROM registro_alimento ra
          JOIN alimento a ON a.id_alimento = ra.id_alimento
          WHERE ra.id_registro = rc.id_registro)
       )::numeric, 2) AS "totalCalories",
       ROUND(SUM(
         (SELECT COALESCE(SUM(a.proteinas * ra.cantidad / 100), 0)
          FROM registro_alimento ra
          JOIN alimento a ON a.id_alimento = ra.id_alimento
          WHERE ra.id_registro = rc.id_registro)
       )::numeric, 2) AS "totalProtein",
       ROUND(SUM(
         (SELECT COALESCE(SUM(a.carbohidratos * ra.cantidad / 100), 0)
          FROM registro_alimento ra
          JOIN alimento a ON a.id_alimento = ra.id_alimento
          WHERE ra.id_registro = rc.id_registro)
       )::numeric, 2) AS "totalCarbs",
       ROUND(SUM(
         (SELECT COALESCE(SUM(a.grasas * ra.cantidad / 100), 0)
          FROM registro_alimento ra
          JOIN alimento a ON a.id_alimento = ra.id_alimento
          WHERE ra.id_registro = rc.id_registro)
       )::numeric, 2) AS "totalFat",
       COUNT(DISTINCT CASE WHEN rc.completado = TRUE THEN rc.fecha END) AS "daysCompleted"
     FROM registro_comida rc
     WHERE rc.id_usuario = $1
       AND rc.fecha >= CURRENT_DATE - INTERVAL '7 days'`,
    [userId]
  );

  const row = result.rows[0];

  return {
    userId,
    totalCalories: Number(row.totalCalories) || 0,
    totalProtein: Number(row.totalProtein) || 0,
    totalFat: Number(row.totalFat) || 0,
    totalCarbs: Number(row.totalCarbs) || 0,
    daysCompleted: Number(row.daysCompleted) || 0,
  };
};