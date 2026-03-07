import { Day } from "./days.types";

const days: Day[] = [];

export const createDay = (day: Day) => {

 days.push(day);

 return day;

};

export const getDaysByUser = (userId: number) => {

 return days.filter(day => day.userId === userId);

};

export const completeDay = (id: number) => {

 const day = days.find(d => d.id === id);

 if (!day) return null;

 day.completed = true;

 return day;

};