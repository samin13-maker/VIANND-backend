import { Response } from 'express';
import { pool } from '../config/db';
import { sendError, sendSuccess, sendPaginated, parsePagination } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

// ─── Categorías ───────────────────────────────────────────────────────────────
export const getCategorias = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id_categoria, nombre FROM categoria_alimento ORDER BY nombre'
    );
    sendSuccess(res, { data: result.rows });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener categorías', 500);
  }
};

// ─── Alimentos ────────────────────────────────────────────────────────────────
export const getAlimentos = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, id_categoria } = req.query;
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (nombre) {
      conditions.push(`a.nombre ILIKE $${i++}`);
      params.push(`%${nombre}%`);
    }
    if (id_categoria) {
      conditions.push(`a.id_categoria = $${i++}`);
      params.push(Number(id_categoria));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM alimento a ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT a.id_alimento, a.nombre, a.id_categoria, c.nombre AS categoria,
              a.calorias, a.proteinas, a.carbohidratos, a.grasas
       FROM alimento a
       JOIN categoria_alimento c ON c.id_categoria = a.id_categoria
       ${where}
       ORDER BY a.nombre
       LIMIT $${i++} OFFSET $${i++}`,
      [...params, limit, offset]
    );

    sendPaginated(res, dataResult.rows, total, page, limit);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener alimentos', 500);
  }
};

export const getAlimentoById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_alimento } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.id_alimento, a.nombre, a.id_categoria, c.nombre AS categoria,
              a.calorias, a.proteinas, a.carbohidratos, a.grasas
       FROM alimento a
       JOIN categoria_alimento c ON c.id_categoria = a.id_categoria
       WHERE a.id_alimento = $1`,
      [id_alimento]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Alimento no encontrado', 404);
      return;
    }
    sendSuccess(res, result.rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener alimento', 500);
  }
};