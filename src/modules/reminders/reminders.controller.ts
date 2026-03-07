import { Request, Response } from "express";
import {
 createReminder,
 getRemindersByUser,
 toggleReminder,
 deleteReminder
} from "./reminders.service";

export const createReminderController = (req: Request, res: Response) => {

 const reminder = createReminder(req.body);

 res.status(201).json(reminder);

};

export const getRemindersController = (req: Request, res: Response) => {

 const userId = Number(req.params.userId);

 const reminders = getRemindersByUser(userId);

 res.json(reminders);

};

export const toggleReminderController = (req: Request, res: Response) => {

 const id = Number(req.params.id);

 const reminder = toggleReminder(id);

 if (!reminder) {
  return res.status(404).json({ error: "Reminder not found" });
 }

 res.json(reminder);

};

export const deleteReminderController = (req: Request, res: Response) => {

 const id = Number(req.params.id);

 const deleted = deleteReminder(id);

 if (!deleted) {
  return res.status(404).json({ error: "Reminder not found" });
 }

 res.json({ message: "Reminder deleted" });

};