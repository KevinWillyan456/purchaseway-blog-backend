import { Request, Response } from 'express'
import { UpdateWithAggregationPipeline } from 'mongoose'
import { v4 as uuid } from 'uuid'
import Post from '../models/Post'
import User from '../models/User'

async function indexPost(req: Request, res: Response) {
    try {
        const posts = await Post.find()
            .sort({ title: 1 })
            .collation({ locale: 'pt', strength: 2 })
        return res.status(200).json({ posts })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function indexPostById(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        return res.status(200).json({ post })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function storePost(
    req: Request<{ userId?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { text } = req.body
    const { userId } = req.params

    if (!text) {
        return res.status(400).json({ error: 'data is missing' })
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const post = new Post({
            _id: uuid(),
            conteudo: { text, urlImg: '' },
            respostas: [],
            proprietario: user?._id,
            curtidas: 0,
            dataCriacao: new Date(),
        })

        await post.save()

        return res.status(201).json({ message: 'Post added successfully!' })
    } catch (err) {
        res.status(400).json({ error: err })
    }
}

async function updatePostContent(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { text } = req.body
    const { id } = req.params

    if (!text) {
        return res.status(400).json({ error: 'You must enter with a text' })
    }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ mensagem: 'Post not found' })
        }

        post.conteudo.text = text

        await post.save()

        return res
            .status(200)
            .json({ mensagem: 'Content updated successfully!' })
    } catch (err) {
        return res.status(500).json({ error: err })
    }
}

async function deletePost(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params
    const filter = { _id: id }

    try {
        const post = await Post.deleteOne(filter)
        if (post.deletedCount < 1) {
            return res.status(404).json({ message: 'Post not found' })
        }
        return res.status(200).json({ message: 'Post removed successfully!' })
    } catch (err) {
        return res.status(500).json({ error: err })
    }
}

async function incrementPostLikes(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params

    const filter = { _id: id }
    const updateDoc = {
        $inc: {
            curtidas: 1,
        },
    }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
        await Post.updateOne(filter, updateDoc)

        return res
            .status(200)
            .json({ message: 'Post likes incremented successfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function decrementPostLikes(
    req: Request<{ id?: UpdateWithAggregationPipeline }>,
    res: Response
) {
    const { id } = req.params

    const filter = { _id: id }
    const updateDoc = {
        $inc: {
            curtidas: -1,
        },
    }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
        await Post.updateOne(filter, updateDoc)

        return res
            .status(200)
            .json({ message: 'Post likes decremented successfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

export {
    indexPost,
    indexPostById,
    storePost,
    updatePostContent,
    deletePost,
    incrementPostLikes,
    decrementPostLikes,
}
