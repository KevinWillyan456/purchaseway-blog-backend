import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./database";
import { routes } from "./routes";
import AuthAPI from "./middlewares/AuthAPI";

const app = express();

config();
connectToDatabase();

app.use(cors());
app.use(AuthAPI);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(routes);

const port = process.env.PORT || 3000;

app.listen(port, () =>
    console.log(`Servidor rodando na porta: ${port} - http://localhost:${port}`)
);
