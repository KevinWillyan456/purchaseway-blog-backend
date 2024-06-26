import { Request, Response } from 'express'
import { UpdateWithAggregationPipeline } from 'mongoose'
import { v4 as uuid } from 'uuid'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Post from '../models/Post'

const USER_NAME_MIN_LENGTH = 3
const USER_NAME_MAX_LENGTH = 100
const USER_PASSWORD_MIN_LENGTH = 6
const USER_PASSWORD_MAX_LENGTH = 100

async function indexUser(req: Request, res: Response) {
    try {
        const users = await User.find({}, '-senha -senhaGoogle')
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
        const user = await User.findById(id, '-senha -senhaGoogle')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({ user })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function storeUser(req: Request, res: Response) {
    const {
        nome,
        senha,
        email,
        stayConnected,
        picture,
        isGoogle = false,
    } = req.body

    if (!nome || !senha || !email) {
        return res.status(400).json({ error: 'data is missing' })
    }

    if (nome.length < USER_NAME_MIN_LENGTH) {
        return res.status(400).json({
            error: `name must be at least ${USER_NAME_MIN_LENGTH} characters`,
        })
    }

    if (nome.length > USER_NAME_MAX_LENGTH) {
        return res.status(400).json({
            error: `name must be at most ${USER_NAME_MAX_LENGTH} characters`,
        })
    }

    if (senha.length < USER_PASSWORD_MIN_LENGTH) {
        return res.status(400).json({
            error: `password must be at least ${USER_PASSWORD_MIN_LENGTH} characters`,
        })
    }

    if (senha.length > USER_PASSWORD_MAX_LENGTH) {
        return res.status(400).json({
            error: `password must be at most ${USER_PASSWORD_MAX_LENGTH} characters`,
        })
    }

    if (stayConnected && typeof stayConnected !== 'boolean') {
        return res
            .status(400)
            .json({ error: 'stayConnected must be a boolean' })
    }

    const encryptedPassword = await bcrypt.hash(senha, 8)

    if (picture) {
        if (
            await fetch(picture)
                .then((res) => res.status !== 200)
                .catch(() => true)
        ) {
            return res.status(400).json({ error: 'urlImg is invalid' })
        }
    }

    const user = new User({
        _id: uuid(),
        nome,
        senha: encryptedPassword,
        email,
        fotoPerfil: picture || '',
        dataCriacao: new Date(),
        isGoogle,
    })

    try {
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(409).json({ message: 'User already exists' })
        }

        await user.save()

        const token = jwt.sign({ id: user._id }, `${process.env.JWT_SECRET}`, {
            expiresIn: stayConnected ? '7d' : '1d',
        })

        return res.status(201).json({
            message: 'User added successfully!',
            token,
            stayConnected,
        })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function updateUser(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { nome, senha, email, fotoPerfil, novaSenha } = req.body
    const { id } = req.params

    if (!nome && !senha && !email) {
        return res.status(400).json({ error: 'You must enter a new data' })
    }

    if (nome && nome.length < USER_NAME_MIN_LENGTH) {
        return res.status(400).json({
            error: `name must be at least ${USER_NAME_MIN_LENGTH} characters`,
        })
    }

    if (nome && nome.length > USER_NAME_MAX_LENGTH) {
        return res.status(400).json({
            error: `name must be at most ${USER_NAME_MAX_LENGTH} characters`,
        })
    }

    if (senha && senha.length < USER_PASSWORD_MIN_LENGTH) {
        return res.status(400).json({
            error: `password must be at least ${USER_PASSWORD_MIN_LENGTH} characters`,
        })
    }

    if (senha && senha.length > USER_PASSWORD_MAX_LENGTH) {
        return res.status(400).json({
            error: `password must be at most ${USER_PASSWORD_MAX_LENGTH} characters`,
        })
    }

    if (fotoPerfil) {
        if (
            await fetch(fotoPerfil)
                .then((res) => res.status !== 200)
                .catch(() => true)
        ) {
            return res.status(400).json({ error: 'urlImg is invalid' })
        }
    }

    let encryptedPassword, encryptedGooglePassword, hasGooglePassword

    if (senha) {
        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (user?.isGoogle) {
            if (user?.hasGooglePassword) {
                if (!novaSenha) {
                    return res
                        .status(400)
                        .json({ error: 'You must enter a new password' })
                }

                if (!user) {
                    return res.status(404).json({ message: 'User not found' })
                }

                const passwordIsValid = await bcrypt.compare(
                    senha,
                    user.senhaGoogle
                )

                if (!passwordIsValid) {
                    return res.status(401).json({ message: 'Invalid password' })
                }

                if (senha === novaSenha) {
                    return res.status(400).json({
                        error: 'The new password must be different from the current one',
                    })
                }

                encryptedGooglePassword = await bcrypt.hash(novaSenha, 8)
            } else {
                hasGooglePassword = true
                encryptedGooglePassword = await bcrypt.hash(senha, 8)
            }
        } else {
            if (!novaSenha) {
                return res
                    .status(400)
                    .json({ error: 'You must enter a new password' })
            }

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            const passwordIsValid = await bcrypt.compare(senha, user.senha)

            if (!passwordIsValid) {
                return res.status(401).json({ message: 'Invalid password' })
            }

            if (senha === novaSenha) {
                return res.status(400).json({
                    error: 'The new password must be different from the current one',
                })
            }

            encryptedPassword = await bcrypt.hash(novaSenha, 8)
        }
    }

    const filter = { _id: id }
    const updateDoc = {
        $set: {
            nome,
            senha: encryptedPassword,
            senhaGoogle: encryptedGooglePassword,
            email,
            fotoPerfil,
            hasGooglePassword,
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
    req: Request<{
        email?: string
    }>,
    res: Response
) {
    const { email } = req.params

    const token = req.headers.token as string

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        let decoded: jwt.JwtPayload

        try {
            decoded = jwt.verify(
                token,
                `${process.env.JWT_SECRET}`
            ) as jwt.JwtPayload
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        const { id } = decoded

        const user = await User.findById(id, '-senha -senhaGoogle')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const filter = { _id: id }

        if (user.email !== email) {
            return res.status(401).json({ message: 'Email not authorized' })
        }

        await Post.deleteMany({ proprietario: id })
        await Post.updateMany(
            {},
            { $pull: { respostas: { userId: id } } },
            { multi: true }
        )

        await Post.updateMany({}, { $pull: { curtidas: id } }, { multi: true })
        await Post.updateMany(
            {},
            { $pull: { 'respostas.$[].curtidas': id } },
            { multi: true }
        )

        const userDelete = await User.deleteOne(filter)
        if (userDelete.deletedCount < 1) {
            return res.status(404).json({ message: 'User not deleted' })
        }
        return res.status(200).json({ message: 'User removed succesfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function login(req: Request, res: Response) {
    const { email, senha, stayConnected, isGoogle = false } = req.body

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

        if (user.isGoogle && user.hasGooglePassword && !isGoogle) {
            const passwordIsValid = await bcrypt.compare(
                senha,
                user.senhaGoogle
            )

            if (!passwordIsValid) {
                return res.status(401).json({ message: 'Invalid password' })
            }

            const token = jwt.sign(
                { id: user._id },
                `${process.env.JWT_SECRET}`,
                {
                    expiresIn: stayConnected ? '7d' : '1d',
                }
            )

            return res.status(200).json({
                message: 'User logged in successfully!',
                token,
                stayConnected,
            })
        } else {
            const passwordIsValid = await bcrypt.compare(senha, user.senha)

            if (!passwordIsValid) {
                return res.status(401).json({ message: 'Invalid password' })
            }

            const token = jwt.sign(
                { id: user._id },
                `${process.env.JWT_SECRET}`,
                {
                    expiresIn: stayConnected ? '7d' : '1d',
                }
            )

            return res.status(200).json({
                message: 'User logged in successfully!',
                token,
                stayConnected,
            })
        }
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function logout(req: Request, res: Response) {
    const token = req.headers.token as string

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }
    try {
        const decoded = jwt.verify(
            token,
            `${process.env.JWT_SECRET}`
        ) as jwt.JwtPayload

        const user = await User.findById(decoded.id, '-senha -senhaGoogle')

        if (!user) {
            return res
                .status(404)
                .json({ message: 'User not found, token invalid' })
        }

        const tokens = user.tokens.filter((t) => {
            const diff =
                new Date().getTime() - new Date(t.dataCriacao).getTime()
            return diff <= 7 * 24 * 60 * 60 * 1000
        })

        await User.updateOne({ _id: decoded.id }, { tokens })

        await User.updateOne(
            { _id: decoded.id },
            {
                $push: {
                    tokens: {
                        _id: uuid(),
                        token,
                        dataCriacao: new Date(),
                    },
                },
            }
        )

        return res
            .status(200)
            .json({ message: 'User logged out successfully!' })
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

        const decoded = jwt.verify(
            token,
            `${process.env.JWT_SECRET}`
        ) as jwt.JwtPayload

        const user = await User.findById(decoded.id, '-senha -senhaGoogle')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const tokenExists = user.tokens.some((t) => t.token === token)
        if (tokenExists) {
            return res
                .status(401)
                .json({ message: 'Token is invalid', valid: false })
        }

        return res.status(200).json({ message: 'Token is valid', valid: true })
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid', valid: false })
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

        const user = await User.findById(decoded.id, '-senha -senhaGoogle')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const postsByUser = await Post.find({ proprietario: user._id })
        postsByUser.forEach((post) => {
            post.curtidas = [...new Set(post.curtidas)]
        })

        const likes = postsByUser.reduce((acc, post) => {
            return acc + post.curtidas.length
        }, 0)

        user.curtidas = likes

        return res.status(200).json({ user, posts: postsByUser.length })
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid' })
    }
}

async function getUserInfo(req: Request, res: Response) {
    const token = req.headers.token as string

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        const decoded = jwt.verify(
            token,
            `${process.env.JWT_SECRET}`
        ) as jwt.JwtPayload

        const user = await User.findById(decoded.id, '-senha -senhaGoogle')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const userEmpty = {
            nome: user.nome,
            dataCriacao: user.dataCriacao,
            posts: 0,
            curtidasPosts: 0,
            respostasPosts: 0,
            imagensCompartilhadas: 0,
            videosCompartilhados: 0,
        }

        const posts = await Post.aggregate([
            {
                $match: { proprietario: user._id },
            },
            {
                $group: {
                    _id: '$_id',
                    total: { $sum: 1 },
                },
            },
        ])

        userEmpty.posts = posts.length

        const postsByUser = await Post.find({ proprietario: user._id })
        postsByUser.forEach((post) => {
            post.curtidas = [...new Set(post.curtidas)]
        })

        const likes = postsByUser.reduce((acc, post) => {
            return acc + post.curtidas.length
        }, 0)

        userEmpty.curtidasPosts = likes

        const respostas = postsByUser.reduce((acc, post) => {
            return acc + post.respostas.length
        }, 0)

        userEmpty.respostasPosts = respostas

        const imagens = postsByUser.reduce((acc, post) => {
            if (post.conteudo.urlImg !== '') {
                return acc + 1
            }
            return acc
        }, 0)

        userEmpty.imagensCompartilhadas = imagens

        const videos = postsByUser.reduce((acc, post) => {
            if (post.conteudo.videoId !== '') {
                return acc + 1
            }
            return acc
        }, 0)

        userEmpty.videosCompartilhados = videos

        return res.status(200).json({ user: userEmpty })
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid' })
    }
}

async function getUserPosts(req: Request, res: Response) {
    const token = req.headers.token as string

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        const decoded = jwt.verify(
            token,
            `${process.env.JWT_SECRET}`
        ) as jwt.JwtPayload

        const user = await User.findById(decoded.id, '-senha -senhaGoogle')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const posts = (
            await Post.find({ proprietario: user._id })
                .sort({ title: 1 })
                .collation({ locale: 'pt', strength: 2 })
        ).map((post) => ({
            ...post.toObject(),
            proprietarioId: post.proprietario,
        }))

        posts.forEach((p) => {
            p.curtidas = [...new Set(p.curtidas)]
        })
        posts.forEach((p) => {
            p.respostas.forEach((r) => {
                r.curtidas = [...new Set(r.curtidas)]
            })
        })

        posts.sort((a, b) => b.curtidas.length - a.curtidas.length)

        const users = await User.find({
            _id: {
                $in: [
                    ...new Set(
                        posts
                            .map((p) => [
                                p.proprietarioId,
                                ...p.respostas.map((r) => r.userId),
                            ])
                            .flat()
                    ),
                ],
            },
        })

        posts.forEach((p) => {
            p.proprietario =
                users.find((u) => u._id === p.proprietarioId)?.nome || ''
        })
        posts.forEach((p) => {
            p.respostas.forEach((r) => {
                r.userName = users.find((u) => u._id === r.userId)?.nome || ''
            })
        })

        posts.forEach((p) => {
            p.fotoPerfil = users.find(
                (u) => u._id === p.proprietarioId
            )?.fotoPerfil
        })
        posts.forEach((p) => {
            p.respostas.forEach((r) => {
                r.fotoPerfil = users.find((u) => u._id === r.userId)?.fotoPerfil
            })
        })

        return res.status(200).json({ posts })
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
    logout,
    verifyToken,
    getUserByToken,
    getUserInfo,
    getUserPosts,
}
