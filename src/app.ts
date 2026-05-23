import express, { Application, Request, Response } from "express";
import cors from "cors";
import { AuthRoutes } from "./modules/auth/auth.route";
import { IssueRoutes } from "./modules/issues/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";

const app: Application = express();

app.use(express.json());
app.use(cors());

// application routes
app.use("/api/auth", AuthRoutes);
app.use("/api/issues", IssueRoutes);

const testRoute = (req: Request, res: Response) => {
  res.send("DevPulse API is running");
};

app.get("/", testRoute);

// global error handler
app.use(globalErrorHandler as any);

// not found
app.use(notFound as any);

export default app;
