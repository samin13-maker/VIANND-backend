import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error no controlado:', err.message);
  sendError(res, 'Error interno del servidor', 500);
};

export const notFound = (_req: Request, res: Response): void => {
  sendError(res, 'Ruta no encontrada', 404);
};