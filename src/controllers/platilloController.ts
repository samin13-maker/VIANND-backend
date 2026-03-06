import { Response } from 'express';
import { pool } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getPlatillos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const platillos = await pool.query(
      `SELECT id_platillo, nombre FROM platillo WHERE id_usuario = $1 ORDER BY nombre`,
      [req.user!.id_usuario]
    );

    const data = await Promise.all(
      platillos.rows.map(async (p) => {
        const alimentos = await pool.query(
          `SELECT a.id_alimento, a.nombre, pa.cantidad,
                  ROUND((a.calorias * pa.cantidad / 100)::numeric, 2) AS calorias_calculadas,
                  ROUND((a.proteinas * pa.cantidad / 100)::numeric, 2) AS proteinas_calculadas,
                  ROUND((a.carbohidratos * pa.cantidad / 100)::numeric, 2) AS carbohidratos_calculados,
                  ROUND((a.grasas * pa.cantidad / 100)::numeric, 2) AS grasas_calculadas
           FROM platillo_alimento pa
           JOIN alimento a ON a.id_alimento = pa.id_alimento
           WHERE pa.id_platillo = $1`,
          [p.id_platillo]
        );
        const total_calorias = alimentos.rows.reduce(
          (sum: number, a: { calorias_calculadas: string }) => sum + parseFloat(a.calorias_calculadas), 0
        );
        return { ...p, alimentos: alimentos.rows, total_calorias: Math.round(total_calorias * 100) / 100 };
      })
    );

    sendSuccess(res, { data });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener platillos', 500);
  }
};

export const createPlatillo = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, alimentos } = req.body;
  const id_usuario = req.user!.id_usuario;

  if (!nombre || !Array.isArray(alimentos) || alimentos.length === 0) {
    sendError(res, 'nombre y al menos un alimento son requeridos', 400);
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const platResult = await client.query(
      `INSERT INTO platillo (nombre, id_usuario) VALUES ($1, $2) RETURNING id_platillo, nombre`,
      [nombre, id_usuario]
    );
    const platillo = platResult.rows[0];

    for (const item of alimentos) {
      await client.query(
        `INSERT INTO platillo_alimento (id_platillo, id_alimento, cantidad) VALUES ($1, $2, $3)`,
        [platillo.id_platillo, item.id_alimento, item.cantidad]
      );
    }

    await client.query('COMMIT');
    sendSuccess(res, { ...platillo, alimentos }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    sendError(res, 'Error al crear platillo', 500);
  } finally {
    client.release();
  }
};