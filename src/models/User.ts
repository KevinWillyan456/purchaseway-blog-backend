import { Schema, model, Document } from "mongoose";
import { PostDoc } from "./Post";

export interface UserDoc extends Document {
    _id: string;
    nome: string;
    senha: string;
    email: string;
    dataCriacao: Date;
    posts: Array<PostDoc["_id"]>;
    curtidas: number;
}

const userSchema = new Schema<UserDoc>({
    _id: { type: String, required: true },
    nome: { type: String, required: true },
    senha: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dataCriacao: { type: Date, default: Date.now },
    posts: [{ type: String, ref: "Post" }],
    curtidas: { type: Number, default: 0 },
});

export default model<UserDoc>("User", userSchema);
