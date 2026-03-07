import { WeeklyReport } from "./reports.types";

export const generateWeeklyReport = (userId: number): WeeklyReport => {

 // ejemplo simple mientras no hay DB

 const report: WeeklyReport = {

  userId,

  totalCalories: 2000,
  totalProtein: 120,
  totalFat: 70,
  totalCarbs: 250,

  daysCompleted: 5

 };

 return report;

};