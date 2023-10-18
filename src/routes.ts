import express from "express";
import {
    deleteUser,
    indexUser,
    indexUserById,
    storeUser,
    updateUser,
} from "./controllers/UserController";

export const routes = express.Router();

routes.get("/users", indexUser);
routes.get("/users/:id", indexUserById);
routes.post("/users", storeUser);
routes.put("/users/:id", updateUser);
routes.delete("/users/:id", deleteUser);
