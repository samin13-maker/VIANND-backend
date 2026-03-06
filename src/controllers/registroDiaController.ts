import { Response } from 'express';
import { pool } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

// ─── Tipo Comida ──────────────────────────────────────────────────────────────
export const getTiposComida = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT id_tipo_comida, nombre FROM tipo_comida ORDER BY id_tipo_comida');
    sendSuccess(res, { data: result.rows });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener tipos de comida', 500);
  }
};

// ─── Registro Día ─────────────────────────────────────────────────────────────
export const getRegistrosDia = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fecha_inicio, fecha_fin } = req.query;
  const id_usuario = req.user!.id_usuario;

  try {
    const conditions = [`id_usuario = $1`];
    const params: unknown[] = [id_usuario];
    let i = 2;

    if (fecha_inicio) { conditions.push(`fecha >= $${i++}`); params.push(fecha_inicio); }
    if (fecha_fin) { conditions.push(`fecha <= $${i++}`); params.push(fecha_fin); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await pool.query(
      `SELECT id_dia, id_usuario, fecha, dia_completado
       FROM registro_dia ${where} ORDER BY fecha DESC`,
      params
    );

    // Calcular racha actual de días consecutivos completados
    const rachaResult = await pool.query(
      `SELECT COUNT(*) FROM (
        SELECT fecha, dia_completado,
               fecha - (ROW_NUMBER() OVER (ORDER BY fecha DESC))::int AS grp
        FROM registro_dia
        WHERE id_usuario = $1 AND dia_completado = TRUE
        ORDER BY fecha DESC
      ) t WHERE grp = (
        SELECT MAX(fecha - (ROW_NUMBER() OVER (ORDER BY fecha DESC))::int)
        FROM registro_dia
        WHERE id_usuario = $1 AND dia_completado = TRUE
      )`,
      [id_usuario]
    );

    sendSuccess(res, {
      data: result.rows,
      racha_actual: parseInt(rachaResult.rows[0]?.count || '0', 10),
    });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener registros de día', 500);
  }
};

export const getRegistroDiaHoy = async (req: AuthRequest, res: Response): Promise<void> => {
  const id_usuario = req.user!.id_usuario;

  try {
    // Obtener o crear el registro del día actual
    let result = await pool.query(
      `SELECT id_dia, id_usuario, fecha, dia_completado
       FROM registro_dia WHERE id_usuario = $1 AND fecha = CURRENT_DATE`,
      [id_usuario]
    );

    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO registro_dia (id_usuario, fecha, dia_completado)
         VALUES ($1, CURRENT_DATE, FALSE)
         RETURNING id_dia, id_usuario, fecha, dia_completado`,
        [id_usuario]
      );
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener registro de hoy', 500);
  }
};