import { Response } from 'express';
import { pool } from '../config/db';
import { sendError, sendSuccess, sendPaginated, parsePagination } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getReportes = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const id_usuario = req.user!.id_usuario;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM reporte_semanal WHERE id_usuario = $1`, [id_usuario]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT * FROM reporte_semanal WHERE id_usuario = $1
       ORDER BY semana_inicio DESC LIMIT $2 OFFSET $3`,
      [id_usuario, limit, offset]
    );

    sendPaginated(res, dataResult.rows, total, page, limit);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener reportes', 500);
  }
};

export const getReporteById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_reporte } = req.params;
  const id_usuario = req.user!.id_usuario;

  try {
    const result = await pool.query(
      `SELECT * FROM reporte_semanal WHERE id_reporte = $1 AND id_usuario = $2`,
      [id_reporte, id_usuario]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Reporte no encontrado', 404);
      return;
    }
    sendSuccess(res, result.rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener reporte', 500);
  }
};

export const generarReporte = async (req: AuthRequest, res: Response): Promise<void> => {
  const id_usuario = req.user!.id_usuario;

  // Inicio de semana = lunes de la semana actual
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0=dom, 1=lun...
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const semana_inicio = lunes.toISOString().split('T')[0];
  const semana_fin = domingo.toISOString().split('T')[0];

  try {
    const existing = await pool.query(
      `SELECT id_reporte FROM reporte_semanal WHERE id_usuario = $1 AND semana_inicio = $2`,
      [id_usuario, semana_inicio]
    );
    if (existing.rows.length > 0) {
      sendError(res, 'Ya existe un reporte para la semana actual', 400);
      return;
    }

    // Calcular macros totales de la semana
    const macrosResult = await pool.query(
      `SELECT
         COALESCE(AVG(daily.total_calorias), 0) AS calorias_promedio,
         COALESCE(SUM(daily.total_proteinas), 0) AS proteinas_total,
         COALESCE(SUM(daily.total_carbohidratos), 0) AS carbohidratos_total,
         COALESCE(SUM(daily.total_grasas), 0) AS grasas_total
       FROM (
         SELECT
           rc.fecha,
           SUM(a.calorias * ra.cantidad / 100) AS total_calorias,
           SUM(a.proteinas * ra.cantidad / 100) AS total_proteinas,
           SUM(a.carbohidratos * ra.cantidad / 100) AS total_carbohidratos,
           SUM(a.grasas * ra.cantidad / 100) AS total_grasas
         FROM registro_comida rc
         JOIN registro_alimento ra ON ra.id_registro = rc.id_registro
         JOIN alimento a ON a.id_alimento = ra.id_alimento
         WHERE rc.id_usuario = $1 AND rc.fecha BETWEEN $2 AND $3
         GROUP BY rc.fecha
       ) daily`,
      [id_usuario, semana_inicio, semana_fin]
    );

    // Cumplimiento: días completados vs días de la semana transcurridos
    const diasTranscurridos = Math.min(7, Math.floor((hoy.getTime() - lunes.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const cumplimientoResult = await pool.query(
      `SELECT COUNT(*) AS dias_completados FROM registro_dia
       WHERE id_usuario = $1 AND fecha BETWEEN $2 AND $3 AND dia_completado = TRUE`,
      [id_usuario, semana_inicio, semana_fin]
    );
    const dias_completados = parseInt(cumplimientoResult.rows[0].dias_completados, 10);
    const porcentaje_cumplimiento = diasTranscurridos > 0
      ? Math.round((dias_completados / diasTranscurridos) * 100)
      : 0;

    // Alimentos fuera de dieta
    const extrasResult = await pool.query(
      `SELECT COUNT(*) AS extras FROM registro_comida
       WHERE id_usuario = $1 AND fecha BETWEEN $2 AND $3 AND fuera_dieta = TRUE`,
      [id_usuario, semana_inicio, semana_fin]
    );
    const alimentos_extra = parseInt(extrasResult.rows[0].extras, 10);

    const macros = macrosResult.rows[0];

    const insertResult = await pool.query(
      `INSERT INTO reporte_semanal
         (id_usuario, semana_inicio, semana_fin, calorias_promedio,
          proteinas_total, carbohidratos_total, grasas_total,
          porcentaje_cumplimiento, alimentos_extra)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id_usuario, semana_inicio, semana_fin,
        Math.round(parseFloat(macros.calorias_promedio) * 100) / 100,
        Math.round(parseFloat(macros.proteinas_total) * 100) / 100,
        Math.round(parseFloat(macros.carbohidratos_total) * 100) / 100,
        Math.round(parseFloat(macros.grasas_total) * 100) / 100,
        porcentaje_cumplimiento,
        alimentos_extra,
      ]
    );

    sendSuccess(res, insertResult.rows[0], 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al generar reporte', 500);
  }
};