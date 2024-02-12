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

async function indexUserById(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params;

    try {
        const user = await User.findById(id, "-senha");
        return res.status(200).json({ user });
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

async function updateUser(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { nome, senha, email } = req.body;
    const { id } = req.params;

    if (!nome && !senha && !email) {
        return res.status(400).json({ error: "You must enter a new data" });
    }

    let encryptedPassword;

    if (senha) {
        encryptedPassword = await bcrypt.hash(senha, 8);
    }

    const filter = { _id: id };
    const updateDoc = {
        $set: {
            nome,
            senha: encryptedPassword,
            email,
        },
    };

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.updateOne(filter, updateDoc);

        return res.status(200).json({ message: "User updated succesfully!" });
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

async function deleteUser(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params;
    const filter = { _id: id };

    try {
        const user = await User.deleteOne(filter);
        if (user.deletedCount < 1) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User removed succesfully!" });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

export { indexUser, indexUserById, storeUser, updateUser, deleteUser };
