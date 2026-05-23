import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import pool from "../../config/database";
import config from "../../config";
import AppError from "../../utils/AppError";

const signup = async (payload: any) => {
  const { name, email, password, role = "contributor" } = payload;

  if (!name || !email || !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Name, email and password are required",
    );
  }

  if (role !== "contributor" && role !== "maintainer") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Role must be contributor or maintainer",
    );
  }

  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

  const query = `
    INSERT INTO users (name, email, password, role, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, name, email, role, created_at, updated_at;
  `;

  try {
    const result = await pool.query(query, [name, email, hashedPassword, role]);
    return result.rows[0];
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
    }
    throw error;
  }
};

const login = async (payload: any) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Email and password are required",
    );
  }

  const query = `SELECT * FROM users WHERE email = $1;`;
  const result = await pool.query(query, [email]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.jwt_secret as string, {
    expiresIn: config.jwt_expires_in as any,
  });

  const { password: _password, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};

export const AuthService = {
  signup,
  login,
};
