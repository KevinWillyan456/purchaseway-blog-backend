import express, { Request, Response } from "express";

export const routes = express.Router();

routes.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});
