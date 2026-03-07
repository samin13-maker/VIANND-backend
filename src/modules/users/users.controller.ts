import { Request, Response } from "express";
import {
 createUser, getUserById, updateUser, deleteUser, getAllUsers} from "./users.service";

import { mapUserResponse } from "./users.mapper";

export const createUserController = async (req: Request, res: Response) => {

 const { email, password, name, age, gender } = req.body;

 const user = await createUser({
  email,
  password,
  name,
  age,
  gender
 });

 res.status(201).json(mapUserResponse(user));

};

export const getUserController = (req: Request, res: Response) => {

 const id = String(req.params.id);

 const user = getUserById(id);

 if (!user) {
  return res.status(404).json({ error: "User not found" });
 }

 res.json(mapUserResponse(user));

};

export const updateUserController = async (req: Request, res: Response) => {

 const id = String(req.params.id);

 const user = await updateUser(id, req.body);

 if (!user) {
  return res.status(404).json({ error: "User not found" });
 }

 res.json(mapUserResponse(user));

};

export const deleteUserController = (req: Request, res: Response) => {

 const id = String(req.params.id);

 const deleted = deleteUser(id);

 if (!deleted) {
  return res.status(404).json({ error: "User not found" });
 }

 res.json({ message: "User deleted" });

};

export const getUsersController = (req: Request, res: Response) => {

 const users = getAllUsers();

 res.json(users.map(mapUserResponse));

};