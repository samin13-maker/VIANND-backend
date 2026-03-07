import { Request, Response } from "express";
import { generateWeeklyReport } from "./reports.service";

export const weeklyReportController = (req: Request, res: Response) => {

 const userId = Number(req.params.userId);

 const report = generateWeeklyReport(userId);

 res.json(report);

};