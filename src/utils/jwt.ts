import jwt from "jsonwebtoken";

const SECRET = "viannd-secret";

export const generateToken = (userId: string) => {

 return jwt.sign(
  { userId },
  SECRET,
  { expiresIn: "7d" }
 );

};

export const verifyToken = (token: string) => {

 return jwt.verify(token, SECRET);

};