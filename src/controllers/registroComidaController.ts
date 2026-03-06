import { Response } from 'express';
import { pool } from '../config/db';
import { sendError, sendSuccess, sendPaginated, parsePagination } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

const getAlimentosDeRegistro = async (id_registro: number) => {
  const result = await pool.query(
    `SELECT a.id_alimento, a.nombre, ra.cantidad,
            ROUND((a.calorias * ra.cantidad / 100)::numeric, 2) AS calorias_calculadas,
            ROUND((a.proteinas * ra.cantidad / 100)::numeric, 2) AS proteinas_calculadas,
            ROUND((a.carbohidratos * ra.cantidad / 100)::numeric, 2) AS carbohidratos_calculados,
            ROUND((a.grasas * ra.cantidad / 100)::numeric, 2) AS grasas_calculadas
     FROM registro_alimento ra
     JOIN alimento a ON a.id_alimento = ra.id_alimento
     WHERE ra.id_registro = $1`,
    [id_registro]
  );
  const total_calorias = result.rows.reduce(
    (sum: number, a: { calorias_calculadas: string }) => sum + parseFloat(a.calorias_calculadas), 0
  );
  return { alimentos: result.rows, total_calorias: Math.round(total_calorias * 100) / 100 };
};

export const getRegistrosComida = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fecha, fecha_inicio, fecha_fin, id_tipo_comida, fuera_dieta } = req.query;
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const id_usuario = req.user!.id_usuario;

  try {
    const conditions = [`rc.id_usuario = $1`];
    const params: unknown[] = [id_usuario];
    let i = 2;

    if (fecha) { conditions.push(`rc.fecha = $${i++}`); params.push(fecha); }
    if (fecha_inicio) { conditions.push(`rc.fecha >= $${i++}`); params.push(fecha_inicio); }
    if (fecha_fin) { conditions.push(`rc.fecha <= $${i++}`); params.push(fecha_fin); }
    if (id_tipo_comida) { conditions.push(`rc.id_tipo_comida = $${i++}`); params.push(Number(id_tipo_comida)); }
    if (fuera_dieta !== undefined) { conditions.push(`rc.fuera_dieta = $${i++}`); params.push(fuera_dieta === 'true'); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(`SELECT COUNT(*) FROM registro_comida rc ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT rc.id_registro, rc.id_usuario, rc.fecha, rc.hora_registro,
              rc.id_tipo_comida, tc.nombre AS tipo_comida,
              rc.fuera_dieta, rc.completado, rc.id_dia
       FROM registro_comida rc
       JOIN tipo_comida tc ON tc.id_tipo_comida = rc.id_tipo_comida
       ${where}
       ORDER BY rc.fecha DESC, rc.hora_registro DESC
       LIMIT $${i++} OFFSET $${i++}`,
      [...params, limit, offset]
    );

    const data = await Promise.all(
      dataResult.rows.map(async (rc) => {
        const { alimentos, total_calorias } = await getAlimentosDeRegistro(rc.id_registro);
        return { ...rc, alimentos, total_calorias };
      })
    );

    sendPaginated(res, data, total, page, limit);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener registros', 500);
  }
};

export const getRegistroById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_registro } = req.params;
  const id_usuario = req.user!.id_usuario;

  try {
    const result = await pool.query(
      `SELECT rc.id_registro, rc.id_usuario, rc.fecha, rc.hora_registro,
              rc.id_tipo_comida, tc.nombre AS tipo_comida,
              rc.fuera_dieta, rc.completado, rc.id_dia
       FROM registro_comida rc
       JOIN tipo_comida tc ON tc.id_tipo_comida = rc.id_tipo_comida
       WHERE rc.id_registro = $1 AND rc.id_usuario = $2`,
      [id_registro, id_usuario]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Registro no encontrado', 404);
      return;
    }
    const { alimentos, total_calorias } = await getAlimentosDeRegistro(Number(id_registro));
    sendSuccess(res, { ...result.rows[0], alimentos, total_calorias });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al obtener registro', 500);
  }
};

export const createRegistroComida = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fecha, hora_registro, id_tipo_comida, fuera_dieta, completado, id_dia, alimentos } = req.body;
  const id_usuario = req.user!.id_usuario;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const rcResult = await client.query(
      `INSERT INTO registro_comida (id_usuario, fecha, hora_registro, id_tipo_comida, fuera_dieta, completado, id_dia)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id_usuario, fecha, hora_registro, id_tipo_comida, fuera_dieta ?? false, completado ?? false, id_dia ?? null]
    );
    const registro = rcResult.rows[0];

    if (Array.isArray(alimentos) && alimentos.length > 0) {
      for (const item of alimentos) {
        await client.query(
          `INSERT INTO registro_alimento (id_registro, id_alimento, cantidad) VALUES ($1, $2, $3)`,
          [registro.id_registro, item.id_alimento, item.cantidad]
        );
      }
    }

    await client.query('COMMIT');
    const { alimentos: ali, total_calorias } = await getAlimentosDeRegistro(registro.id_registro);
    sendSuccess(res, { ...registro, alimentos: ali, total_calorias }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    sendError(res, 'Error al crear registro', 500);
  } finally {
    client.release();
  }
};

export const updateRegistroComida = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_registro } = req.params;
  const { hora_registro, completado, alimentos } = req.body;
  const id_usuario = req.user!.id_usuario;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id_registro FROM registro_comida WHERE id_registro = $1 AND id_usuario = $2`,
      [id_registro, id_usuario]
    );
    if (existing.rows.length === 0) {
      sendError(res, 'Registro no encontrado', 404);
      return;
    }

    await client.query(
      `UPDATE registro_comida SET
        hora_registro = COALESCE($1, hora_registro),
        completado    = COALESCE($2, completado)
       WHERE id_registro = $3`,
      [hora_registro, completado, id_registro]
    );

    if (Array.isArray(alimentos)) {
      await client.query(`DELETE FROM registro_alimento WHERE id_registro = $1`, [id_registro]);
      for (const item of alimentos) {
        await client.query(
          `INSERT INTO registro_alimento (id_registro, id_alimento, cantidad) VALUES ($1, $2, $3)`,
          [id_registro, item.id_alimento, item.cantidad]
        );
      }
    }

    await client.query('COMMIT');
    const { alimentos: ali, total_calorias } = await getAlimentosDeRegistro(Number(id_registro));
    sendSuccess(res, { id_registro, alimentos: ali, total_calorias });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    sendError(res, 'Error al actualizar registro', 500);
  } finally {
    client.release();
  }
};

export const deleteRegistroComida = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_registro } = req.params;
  const id_usuario = req.user!.id_usuario;

  try {
    const result = await pool.query(
      `DELETE FROM registro_comida WHERE id_registro = $1 AND id_usuario = $2 RETURNING id_registro`,
      [id_registro, id_usuario]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Registro no encontrado', 404);
      return;
    }
    sendSuccess(res, { message: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al eliminar registro', 500);
  }
};

export const completarRegistro = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id_registro } = req.params;
  const id_usuario = req.user!.id_usuario;

  try {
    const result = await pool.query(
      `UPDATE registro_comida SET completado = TRUE
       WHERE id_registro = $1 AND id_usuario = $2
       RETURNING id_registro, completado`,
      [id_registro, id_usuario]
    );
    if (result.rows.length === 0) {
      sendError(res, 'Registro no encontrado', 404);
      return;
    }
    sendSuccess(res, result.rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al completar registro', 500);
  }
};