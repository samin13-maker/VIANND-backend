import { Response } from 'express';
import { PaginatedResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, status = 200) => {
  res.status(status).json(data);
};

export const sendError = (res: Response, message: string, status = 500) => {
  res.status(status).json({ error: message, code: status });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
  res.status(200).json(response);
};

export const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};