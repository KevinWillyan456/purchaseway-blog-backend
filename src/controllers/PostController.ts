import { Request, Response } from 'express'
import { UpdateWithAggregationPipeline } from 'mongoose'
import { v4 as uuid } from 'uuid'
import Post from '../models/Post'
import User from '../models/User'

const MAX_TEXT_LENGTH = 5000
const MAX_TITLE_LENGTH = 100

async function indexPost(req: Request, res: Response) {
    try {
        const posts = await Post.find()
            .sort({ title: 1 })
            .collation({ locale: 'pt', strength: 2 })

        posts.sort((a, b) => b.curtidas.length - a.curtidas.length)

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
    const { text, title, urlImg } = req.body
    const { userId } = req.params

    if (!text || !title) {
        return res.status(400).json({ error: 'data is missing' })
    }

    if (title.length > MAX_TITLE_LENGTH) {
        return res.status(400).json({ error: 'title is too long' })
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({ error: 'text is too long' })
    }

    if (!text.replace(/\s/g, '').length) {
        return res.status(400).json({ error: 'text is empty' })
    }

    if (urlImg) {
        if (
            await fetch(urlImg)
                .then((res) => res.status !== 200)
                .catch(() => true)
        ) {
            return res.status(400).json({ error: 'urlImg is invalid' })
        }
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const post = new Post({
            _id: uuid(),
            conteudo: { text, urlImg, title },
            proprietario: user?._id,
            dataCriacao: new Date(),
        })

        await post.save()

        return res.status(201).json({ message: 'Post added successfully!' })
    } catch (err) {
        res.status(400).json({ error: err })
    }
}

async function updatePost(
    req: Request<{
        id?: UpdateWithAggregationPipeline
        userId?: UpdateWithAggregationPipeline
    }>,
    res: Response
) {
    const { text, urlImg, title } = req.body
    const { id, userId } = req.params

    if (!text && !urlImg && !title) {
        return res.status(400).json({ error: 'You must enter with a data' })
    }

    if (title && title.length > MAX_TITLE_LENGTH) {
        return res.status(400).json({ error: 'title is too long' })
    }

    if (text && text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({ error: 'text is too long' })
    }

    if (!text.replace(/\s/g, '').length) {
        return res.status(400).json({ error: 'text is empty' })
    }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        if (post.proprietario !== (userId as unknown as string)) {
            return res
                .status(401)
                .json({ message: 'You are not the owner of this post' })
        }

        if (text) post.conteudo.text = text

        if (urlImg) {
            post.conteudo.urlImg = urlImg
        } else {
            post.conteudo.urlImg = ''
        }

        if (title) post.conteudo.title = title
        post.wasEdited = true

        await post.save()

        return res.status(200).json({ message: 'Post updated successfully!' })
    } catch (err) {
        return res.status(500).json({ error: err })
    }
}

async function deletePost(
    req: Request<{
        id?: UpdateWithAggregationPipeline
        userId?: UpdateWithAggregationPipeline
    }>,
    res: Response
) {
    const { id, userId } = req.params
    const filter = { _id: id }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        if (post.proprietario !== (userId as unknown as string)) {
            return res
                .status(401)
                .json({ message: 'You are not the owner of this post' })
        }

        const postDelete = await Post.deleteOne(filter)
        if (postDelete.deletedCount < 1) {
            return res.status(404).json({ message: 'Post not removed' })
        }
        return res.status(200).json({ message: 'Post removed successfully!' })
    } catch (err) {
        return res.status(500).json({ error: err })
    }
}

async function togglePostLikes(
    req: Request<{
        id?: UpdateWithAggregationPipeline
        userId?: UpdateWithAggregationPipeline
    }>,
    res: Response
) {
    const { id, userId } = req.params

    const filter = { _id: id }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (post.curtidas.includes(userId as unknown as string)) {
            await Post.updateOne(filter, { $pull: { curtidas: userId } })

            return res
                .status(200)
                .json({ message: 'Post likes decremented successfully!' })
        } else {
            await Post.updateOne(filter, { $push: { curtidas: userId } })

            return res
                .status(200)
                .json({ message: 'Post likes incremented successfully!' })
        }
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function addPostResponse(
    req: Request<{
        id?: UpdateWithAggregationPipeline
        userId?: UpdateWithAggregationPipeline
    }>,
    res: Response
) {
    const { id, userId } = req.params
    const { text } = req.body

    if (!text) {
        return res.status(400).json({ error: 'text is missing' })
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({ error: 'text is too long' })
    }

    if (!text.replace(/\s/g, '').length) {
        return res.status(400).json({ error: 'text is empty' })
    }

    const filter = { _id: id }
    const updateDoc = {
        $push: {
            respostas: {
                _id: uuid(),
                userId,
                text,
                dataCriacao: new Date(),
            },
        },
    }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        await Post.updateOne(filter, updateDoc)

        return res
            .status(200)
            .json({ message: 'Post response added successfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function updatePostResponse(
    req: Request<{
        id?: UpdateWithAggregationPipeline
        responseId?: UpdateWithAggregationPipeline
        userId?: UpdateWithAggregationPipeline
    }>,
    res: Response
) {
    const { id, responseId, userId } = req.params
    const { text } = req.body

    if (!text) {
        return res.status(400).json({ error: 'text is missing' })
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({ error: 'text is too long' })
    }

    if (!text.replace(/\s/g, '').length) {
        return res.status(400).json({ error: 'text is empty' })
    }

    const filter = { _id: id, 'respostas._id': responseId }
    const updateDoc = {
        $set: {
            'respostas.$.text': text,
            'respostas.$.wasEdited': true,
        },
    }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        if (
            !post.respostas.find(
                (r) => r._id === (responseId as unknown as string)
            )
        ) {
            return res.status(404).json({ message: 'Response not found' })
        }

        if (
            post.respostas.find(
                (r) => r._id === (responseId as unknown as string)
            )?.userId !== userId
        ) {
            return res
                .status(401)
                .json({ message: 'You are not the owner of this response' })
        }

        await Post.updateOne(filter, updateDoc)

        return res
            .status(200)
            .json({ message: 'Post response updated successfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function togglePostResponseLikes(
    req: Request<{
        id?: UpdateWithAggregationPipeline
        responseId?: UpdateWithAggregationPipeline
        userId?: UpdateWithAggregationPipeline
    }>,
    res: Response
) {
    const { id, responseId, userId } = req.params

    const filter = { _id: id, 'respostas._id': responseId }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        const response = post.respostas.find(
            (r) => r._id === (responseId as unknown as string)
        )

        if (!response) {
            return res.status(404).json({ message: 'Response not found' })
        }

        if (response.curtidas.includes(userId as unknown as string)) {
            await Post.updateOne(filter, {
                $pull: { 'respostas.$.curtidas': userId },
            })

            return res.status(200).json({
                message: 'Post response likes decremented successfully!',
            })
        } else {
            await Post.updateOne(filter, {
                $push: { 'respostas.$.curtidas': userId },
            })

            return res.status(200).json({
                message: 'Post response likes incremented successfully!',
            })
        }
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

async function deletePostResponse(
    req: Request<{
        id?: UpdateWithAggregationPipeline
        responseId?: UpdateWithAggregationPipeline
        userId?: UpdateWithAggregationPipeline
    }>,
    res: Response
) {
    const { id, responseId, userId } = req.params

    const filter = { _id: id }
    const updateDoc = {
        $pull: {
            respostas: { _id: responseId },
        },
    }

    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        if (
            !post.respostas.find(
                (r) => r._id === (responseId as unknown as string)
            )
        ) {
            return res.status(404).json({ message: 'Response not found' })
        }

        if (
            post.respostas.find(
                (r) => r._id === (responseId as unknown as string)
            )?.userId !== userId
        ) {
            return res
                .status(401)
                .json({ message: 'You are not the owner of this response' })
        }

        await Post.updateOne(filter, updateDoc)

        return res
            .status(200)
            .json({ message: 'Post response removed successfully!' })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

export {
    indexPost,
    indexPostById,
    storePost,
    updatePost,
    deletePost,
    togglePostLikes,
    addPostResponse,
    updatePostResponse,
    togglePostResponseLikes,
    deletePostResponse,
}
