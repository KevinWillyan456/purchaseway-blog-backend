import { Schema, model, Document } from 'mongoose'
import { UserDoc } from './User'

export interface PostDoc extends Document {
    _id: string
    conteudo: { text: string; urlImg: string; title: string }
    respostas: Array<{
        _id: string
        userId: UserDoc['_id']
        text: string
        curtidas: string[]
        dataCriacao: Date
        wasEdited: boolean
    }>
    proprietario: UserDoc['_id']
    curtidas: string[]
    dataCriacao: Date
    wasEdited: boolean
}

const postSchema = new Schema<PostDoc>({
    _id: { type: String, required: true },
    conteudo: {
        text: { type: String },
        urlImg: { type: String, default: '' },
        title: { type: String },
    },

    respostas: [
        {
            _id: { type: String, required: true },
            userId: { type: String, ref: 'User' },
            text: { type: String },
            curtidas: { type: [String] },
            dataCriacao: { type: Date, default: Date.now },
            wasEdited: { type: Boolean, default: false },
        },
    ],
    proprietario: { type: String, ref: 'User', required: true },
    curtidas: { type: [String] },
    dataCriacao: { type: Date, default: Date.now },
    wasEdited: { type: Boolean, default: false },
})

export default model<PostDoc>('Post', postSchema)
