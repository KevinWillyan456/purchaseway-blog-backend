import { Request, Response } from "express";
import { UpdateWithAggregationPipeline } from "mongoose";
import { v4 as uuid } from "uuid";
import User from "../models/User";
import bcrypt from "bcryptjs";

async function indexUser(req: Request, res: Response) {
    try {
        const users = await User.find()
            .sort({ title: 1 })
            .collation({ locale: "pt", strength: 2 });
        return res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

async function storeUser(req: Request, res: Response) {
    const { nome, senha, email } = req.body;

    if (!nome || !senha || !email) {
        return res.status(400).json({ error: "data is missing" });
    }

    const encryptedPassword = await bcrypt.hash(senha, 8);

    const user = new User({
        _id: uuid(),
        nome,
        senha: encryptedPassword,
        email,
        dataCriacao: new Date(),
    });

    try {
        await user.save();

        return res.status(201).json({ message: "User added successfully!" });
    } catch (err) {
        res.status(400).json({ error: err });
    }
}

export { indexUser, storeUser };
