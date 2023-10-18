import { Request, Response } from "express";
import User from "../models/User";

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

export { indexUser };
