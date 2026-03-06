import { Response } from 'express';
import { pool } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getRecordatorios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT r.id_recordatorio, r.id_usuario, r.id_tipo_comida, tc.nombre AS tipo_comida,
              r.hora, r.activo
       FROM recordatorio r
       JOIN tipo_comida tc ON tc.id_tipo_comida = r.id_tipo_comida
       WHERE r.id_usuario = $1
       ORDER BY tc.id_tipo_comida`,
      [req.user!.id_usuario]
    );
    sendSuccess(res, { data: result.rows });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener recordatorios', 500);
  }
};

export const createRecordatorio = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_tipo_comida, hora, activo } = req.body;
  const id_usuario = req.user!.id_usuario;

  try {
    const result = await pool.query(
      `INSERT INTO recordatorio (id_usuario, id_tipo_comida, hora, activo)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_usuario, id_tipo_comida)
       DO UPDATE SET hora = EXCLUDED.hora, activo = EXCLUDED.activo
       RETURNING *`,
      [id_usuario, id_tipo_comida, hora ?? null, activo ?? true]
    );
    sendSuccess(res, result.rows[0], 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al crear recordatorio', 500);
  }
};

export const updateRecordatorio = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_recordatorio } = req.params;
  const { hora } = req.body;
  const id_usuario = req.user!.id_usuario;

  try {
    const result = await pool.query(
      `UPDATE recordatorio SET hora = $1
       WHERE id_recordatorio = $2 AND id_usuario = $3
       RETURNING *`,
      [hora, id_recordatorio, id_usuario]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Recordatorio no encontrado', 404);
      return;
    }
    sendSuccess(res, result.rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al actualizar recordatorio', 500);
  }
};

export const toggleRecordatorio = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_recordatorio } = req.params;
  const { activo } = req.body;
  const id_usuario = req.user!.id_usuario;

  if (typeof activo !== 'boolean') {
    sendError(res, 'El campo activo debe ser booleano', 400);
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE recordatorio SET activo = $1
       WHERE id_recordatorio = $2 AND id_usuario = $3
       RETURNING id_recordatorio, activo`,
      [activo, id_recordatorio, id_usuario]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Recordatorio no encontrado', 404);
      return;
    }
    sendSuccess(res, result.rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al cambiar estado del recordatorio', 500);
  }
};