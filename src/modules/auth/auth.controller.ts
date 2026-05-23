import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const signup = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.signup(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const AuthController = {
  signup,
  login,
};
