import express, { Request, Response } from "express";
import { config } from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./database";
const app = express();
const port = 3000;

config();
connectToDatabase();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});

app.listen(port, () =>
    console.log(`Servidor rodando na porta: ${port} - http://localhost:${port}`)
);
