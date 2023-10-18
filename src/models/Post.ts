import { Schema, model, Document } from "mongoose";
import { UserDoc } from "./User";

export interface PostDoc extends Document {
    conteudo: Array<{ text: string; urlImg: string }>;
    respostas: Array<{ idUser: UserDoc["_id"]; text: string }>;
    proprietario: UserDoc["_id"];
    curtidas: number;
    dataCriacao: Date;
}

const postSchema = new Schema<PostDoc>({
    conteudo: [
        {
            text: { type: String },
            urlImg: { type: String },
        },
    ],
    respostas: [
        {
            idUser: { type: Schema.Types.ObjectId, ref: "User" },
            text: { type: String },
        },
    ],
    proprietario: { type: Schema.Types.ObjectId, ref: "User", required: true },
    curtidas: { type: Number, default: 0 },
    dataCriacao: { type: Date, default: Date.now },
});

export default model<PostDoc>("Post", postSchema);
