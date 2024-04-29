import { Request, Response } from 'express'
import Post from '../models/Post'
import User from '../models/User'

async function someNumbers(req: Request, res: Response) {
    try {
        const posts = await Post.find()
        const users = await User.find()

        return res.json({
            posts: posts.length,
            users: users.length,
        })
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export { someNumbers }
