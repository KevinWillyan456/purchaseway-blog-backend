import { Request, Response, NextFunction } from 'express'

export default function AuthAPI(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const apiKey = req.headers['authorization']

    if (!apiKey || apiKey !== `${process.env.API_KEY || 'none'}`) {
        return res
            .status(401)
            .json({ message: 'API Key invalid or not present' })
    }

    next()
}
