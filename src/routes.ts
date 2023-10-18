import express from "express";
import { indexUser } from "./controllers/UserController";

export const routes = express.Router();

routes.get("/users", indexUser);
