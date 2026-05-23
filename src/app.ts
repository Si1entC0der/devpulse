import express, { Application, Request, Response } from "express";
import cors from "cors";


const app: Application = express();

app.use(express.json());
app.use(cors());


const testRoute = (req: Request, res: Response) => {
  res.send("DevPulse API is running");
};

app.get("/", testRoute);



export default app;
