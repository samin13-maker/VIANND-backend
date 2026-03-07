import { Meal } from "./meals.types";

const meals: Meal[] = [];

export const createMeal = (meal: Meal) => {

 meals.push(meal);

 return meal;

};

export const getMealsByUser = (userId: number) => {

 return meals.filter(meal => meal.userId === userId);

};

export const getMealsByDay = (dayId: number) => {

 return meals.filter(meal => meal.dayId === dayId);

};

export const deleteMeal = (id: number) => {

 const index = meals.findIndex(meal => meal.id === id);

 if (index === -1) return false;

 meals.splice(index, 1);

 return true;

};