import { Schema, model, Document } from 'mongoose'
import { UserDoc } from './User'

export interface PostDoc extends Document {
    _id: string
    conteudo: { text: string; urlImg: string; title: string }
    respostas: Array<{
        _id: string
        userId: UserDoc['_id']
        text: string
        dataCriacao: Date
    }>
    proprietario: UserDoc['_id']
    curtidas: number
    dataCriacao: Date
}

const postSchema = new Schema<PostDoc>({
    _id: { type: String, required: true },
    conteudo: {
        text: { type: String },
        urlImg: { type: String },
        title: { type: String },
    },

    respostas: [
        {
            _id: { type: String, required: true },
            userId: { type: String, ref: 'User' },
            text: { type: String },
            dataCriacao: { type: Date, default: Date.now },
        },
    ],
    proprietario: { type: String, ref: 'User', required: true },
    curtidas: { type: Number, default: 0 },
    dataCriacao: { type: Date, default: Date.now },
})

export default model<PostDoc>('Post', postSchema)
