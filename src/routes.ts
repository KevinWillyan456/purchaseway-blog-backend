import express from "express";
import { indexUser, storeUser } from "./controllers/UserController";

export const routes = express.Router();

routes.get("/users", indexUser);
routes.post("/users", storeUser);
