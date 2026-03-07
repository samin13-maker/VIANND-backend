import { Reminder } from "./reminders.types";

const reminders: Reminder[] = [];

export const createReminder = (reminder: Reminder) => {

 reminders.push(reminder);

 return reminder;

};

export const getRemindersByUser = (userId: number) => {

 return reminders.filter(r => r.userId === userId);

};

export const toggleReminder = (id: number) => {

 const reminder = reminders.find(r => r.id === id);

 if (!reminder) return null;

 reminder.active = !reminder.active;

 return reminder;

};

export const deleteReminder = (id: number) => {

 const index = reminders.findIndex(r => r.id === id);

 if (index === -1) return false;

 reminders.splice(index, 1);

 return true;

};