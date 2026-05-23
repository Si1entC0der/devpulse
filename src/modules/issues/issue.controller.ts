import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IssueService } from "./issue.service";

const createIssue = catchAsync(async (req: Request, res: Response) => {
  const reporter_id = req.user.id;
  const result = await IssueService.createIssue(req.body, reporter_id);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Issue created successfully",
    data: result,
  });
});

const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const result = await IssueService.getAllIssues(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

const getSingleIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await IssueService.getSingleIssue(Number(id));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await IssueService.updateIssue(Number(id), req.body, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Issue updated successfully",
    data: result,
  });
});

const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await IssueService.deleteIssue(Number(id));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Issue deleted successfully",
  });
});

export const IssueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
