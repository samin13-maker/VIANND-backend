import { pool } from "../../config/database";
import { Meal } from "./meals.types";

export const createMeal = async (data: {
  userId: number;
  foodId: number;
  quantity: number;
  mealType: number;
  date: string;
  time: string;
  outsideDiet: boolean;
  completed?: boolean;
  dayId?: number;
}): Promise<Meal> => {
  const result = await pool.query(
    `INSERT INTO registro_comida
       (id_usuario, fecha, hora_registro, id_tipo_comida, fuera_dieta, completado, id_dia)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING
       id_registro AS id,
       id_usuario AS "userId",
       id_tipo_comida AS "mealType",
       fecha AS date,
       hora_registro AS time,
       fuera_dieta AS "outsideDiet",
       completado AS completed,
       id_dia AS "dayId"`,
    [
      data.userId,
      data.date,
      data.time,
      data.mealType,
      data.outsideDiet,
      data.completed ?? false,
      data.dayId ?? null,
    ]
  );

  const meal = result.rows[0];

  if (data.foodId && data.quantity) {
    await pool.query(
      `INSERT INTO registro_alimento (id_registro, id_alimento, cantidad)
       VALUES ($1, $2, $3)`,
      [meal.id, data.foodId, data.quantity]
    );
    meal.foodId = data.foodId;
    meal.quantity = data.quantity;
  }

  return meal;
};

export const getMealsByUser = async (userId: number): Promise<Meal[]> => {
  const result = await pool.query(
    `SELECT
       rc.id_registro AS id,
       rc.id_usuario AS "userId",
       rc.id_tipo_comida AS "mealType",
       rc.fecha AS date,
       rc.hora_registro AS time,
       rc.fuera_dieta AS "outsideDiet",
       rc.completado AS completed,
       rc.id_dia AS "dayId",
       ra.id_alimento AS "foodId",
       ra.cantidad AS quantity
     FROM registro_comida rc
     LEFT JOIN registro_alimento ra ON ra.id_registro = rc.id_registro
     WHERE rc.id_usuario = $1
     ORDER BY rc.fecha DESC, rc.hora_registro DESC`,
    [userId]
  );
  return result.rows;
};

export const getMealsByDay = async (dayId: number): Promise<Meal[]> => {
  const result = await pool.query(
    `SELECT
       rc.id_registro AS id,
       rc.id_usuario AS "userId",
       rc.id_tipo_comida AS "mealType",
       rc.fecha AS date,
       rc.hora_registro AS time,
       rc.fuera_dieta AS "outsideDiet",
       rc.completado AS completed,
       rc.id_dia AS "dayId",
       ra.id_alimento AS "foodId",
       ra.cantidad AS quantity
     FROM registro_comida rc
     LEFT JOIN registro_alimento ra ON ra.id_registro = rc.id_registro
     WHERE rc.id_dia = $1`,
    [dayId]
  );
  return result.rows;
};

export const deleteMeal = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM registro_comida WHERE id_registro = $1 RETURNING id_registro`,
    [id]
  );
  return result.rows.length > 0;
};