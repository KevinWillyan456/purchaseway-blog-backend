import { Schema, model, Document } from 'mongoose'

export interface UserDoc extends Document {
    _id: string
    nome: string
    senha: string
    email: string
    dataCriacao: Date
    curtidas: number
    fotoPerfil: string
    isGoogle: boolean
    hasGooglePassword: boolean
    senhaGoogle: string
}

const userSchema = new Schema<UserDoc>({
    _id: { type: String, required: true },
    nome: { type: String, required: true },
    senha: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dataCriacao: { type: Date, default: Date.now },
    curtidas: { type: Number, default: 0 },
    fotoPerfil: { type: String, default: '' },
    isGoogle: { type: Boolean, default: false },
    hasGooglePassword: { type: Boolean, default: false },
    senhaGoogle: { type: String, default: '' },
})

export default model<UserDoc>('User', userSchema)
