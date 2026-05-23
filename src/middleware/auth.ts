import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import config from "../config";
import AppError from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.headers.authorization;

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
      }

      const decoded = jwt.verify(
        token,
        config.jwt_secret as string,
      ) as JwtPayload;

      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You do not have the required role to access this route",
        );
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
