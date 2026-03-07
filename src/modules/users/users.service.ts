import { comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { getAllUsers, createUser } from "../users/users.service";

export const registerUser = async (data: any) => {

 const { email, password, name, age, gender } = data;

 const users = getAllUsers();

 const existingUser = users.find(u => u.email === email);

 if (existingUser) {
  throw new Error("User already exists");
 }

 const newUser = await createUser({
  email,
  password,
  name,
  age,
  gender
 });

 return newUser;

};


export const loginUser = async (email: string, password: string) => {

 const users = getAllUsers();

 const user = users.find(u => u.email === email);

 if (!user) {
  throw new Error("Invalid credentials");
 }

 const validPassword = await comparePassword(password, user.password);

 if (!validPassword) {
  throw new Error("Invalid credentials");
 }

 const token = generateToken(user.id);

 return {
  token,
  user
 };

};