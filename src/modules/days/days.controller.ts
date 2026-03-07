import { Request, Response } from "express";
import { createDay, getDaysByUser, completeDay } from "./days.service";

export const createDayController = (req: Request, res: Response) => {

 const day = createDay(req.body);

 res.status(201).json(day);

};

export const getDaysController = (req: Request, res: Response) => {

 const userId = Number(req.params.userId);

 const days = getDaysByUser(userId);

 res.json(days);

};

export const completeDayController = (req: Request, res: Response) => {

 const id = Number(req.params.id);

 const day = completeDay(id);

 if (!day) {
  return res.status(404).json({ error: "Day not found" });
 }

 res.json(day);

};