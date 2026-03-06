import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { sendError, sendSuccess } from '../utils/response';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, contrasena, nombre, edad, genero } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id_usuario FROM usuario WHERE email = $1', [email]
    );
    if (existing.rows.length > 0) {
      sendError(res, 'El email ya está registrado', 409);
      return;
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const result = await pool.query(
      `INSERT INTO usuario (nombre, email, contrasena, edad, genero)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, email, edad, genero, fecha_registro, modo_oscuro`,
      [nombre, email, hash, edad, genero]
    );
    const usuario = result.rows[0];

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    sendSuccess(res, { token, usuario }, 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al registrar usuario', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, contrasena } = req.body;

  try {
    const result = await pool.query(
      `SELECT id_usuario, nombre, email, contrasena, edad, genero, fecha_registro, modo_oscuro
       FROM usuario WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      sendError(res, 'Credenciales inválidas', 401);
      return;
    }

    const usuario = result.rows[0];
    const valid = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!valid) {
      sendError(res, 'Credenciales inválidas', 401);
      return;
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    const { contrasena: _, ...usuarioSinPass } = usuario;
    sendSuccess(res, { token, usuario: usuarioSinPass });
  } catch (err) {
    console.error(err);
    sendError(res, 'Error al iniciar sesión', 500);
  }
};