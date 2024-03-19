import { Request, Response } from 'express'
import { UpdateWithAggregationPipeline } from 'mongoose'
import { v4 as uuid } from 'uuid'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Post from '../models/Post'

async function indexUser(req: Request, res: Response) {
    try {
        const users = await User.find({}, '-senha')
            .sort({ title: 1 })
            .collation({ locale: 'pt', strength: 2 })
        return res.status(200).json({ users })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function indexUserById(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params

    try {
        const user = await User.findById(id, '-senha')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({ user })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function storeUser(req: Request, res: Response) {
    const { nome, senha, email } = req.body

    if (!nome || !senha || !email) {
        return res.status(400).json({ error: 'data is missing' })
    }

    const encryptedPassword = await bcrypt.hash(senha, 8)

    const user = new User({
        _id: uuid(),
        nome,
        senha: encryptedPassword,
        email,
        dataCriacao: new Date(),
    })

    try {
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(409).json({ message: 'User already exists' })
        }

        await user.save()

        return res.status(201).json({ message: 'User added successfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function updateUser(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { nome, senha, email } = req.body
    const { id } = req.params

    if (!nome && !senha && !email) {
        return res.status(400).json({ error: 'You must enter a new data' })
    }

    let encryptedPassword

    if (senha) {
        encryptedPassword = await bcrypt.hash(senha, 8)
    }

    const filter = { _id: id }
    const updateDoc = {
        $set: {
            nome,
            senha: encryptedPassword,
            email,
        },
    }

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        await User.updateOne(filter, updateDoc)

        return res.status(200).json({ message: 'User updated succesfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function deleteUser(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params
    const filter = { _id: id }

    try {
        const user = await User.deleteOne(filter)
        if (user.deletedCount < 1) {
            return res.status(404).json({ message: 'User not found' })
        }
        return res.status(200).json({ message: 'User removed succesfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function login(req: Request, res: Response) {
    const { email, senha, stayConnected } = req.body

    if (!email || !senha) {
        return res.status(400).json({ error: 'data is missing' })
    }

    if (typeof stayConnected !== 'boolean') {
        return res
            .status(400)
            .json({ error: 'stayConnected must be a boolean' })
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const passwordIsValid = await bcrypt.compare(senha, user.senha)

        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid password' })
        }

        const token = jwt.sign({ id: user._id }, `${process.env.JWT_SECRET}`, {
            expiresIn: stayConnected ? '7d' : '1d',
        })

        return res.status(200).json({
            message: 'User logged in successfully!',
            token,
            stayConnected,
        })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function verifyToken(req: Request, res: Response) {
    const token = req.headers.token as string

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        jwt.verify(token, `${process.env.JWT_SECRET}`)
        return res.status(200).json({ message: 'Token is valid', valid: true })
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid' })
    }
}

async function getUserByToken(req: Request, res: Response) {
    const token = req.headers.token as string

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        const decoded = jwt.verify(
            token,
            `${process.env.JWT_SECRET}`
        ) as jwt.JwtPayload

        const user = await User.findById(decoded.id, '-senha')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const postsByUser = await Post.find({ proprietario: user._id })
        const likes = postsByUser.reduce((acc, post) => {
            return acc + post.curtidas.length
        }, 0)

        user.curtidas = likes

        return res.status(200).json({ user, posts: postsByUser.length })
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid' })
    }
}

export {
    indexUser,
    indexUserById,
    storeUser,
    updateUser,
    deleteUser,
    login,
    verifyToken,
    getUserByToken,
}
