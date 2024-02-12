import express from 'express'
import {
    deleteUser,
    indexUser,
    indexUserById,
    storeUser,
    updateUser,
} from './controllers/UserController'
import {
    deletePost,
    indexPost,
    indexPostById,
    storePost,
    updatePostContent,
} from './controllers/PostController'

export const routes = express.Router()

routes.get('/users', indexUser)
routes.get('/users/:id', indexUserById)
routes.post('/users', storeUser)
routes.put('/users/:id', updateUser)
routes.delete('/users/:id', deleteUser)

routes.get('/posts', indexPost)
routes.get('/posts/:id', indexPostById)
routes.post('/posts', storePost)
routes.put('/posts/content/:id', updatePostContent)
routes.delete('/posts/:id', deletePost)
