import express from 'express'
import {
    deleteUser,
    indexUser,
    indexUserById,
    storeUser,
    updateUser,
} from './controllers/UserController'
import {
    decrementPostLikes,
    deletePost,
    incrementPostLikes,
    indexPost,
    indexPostById,
    storePost,
    updatePostImg,
    updatePostText,
} from './controllers/PostController'

export const routes = express.Router()

routes.get('/users', indexUser)
routes.get('/users/:id', indexUserById)
routes.post('/users', storeUser)
routes.put('/users/:id', updateUser)
routes.delete('/users/:id', deleteUser)

routes.get('/posts', indexPost)
routes.get('/posts/:id', indexPostById)
routes.post('/posts/:userId', storePost)
routes.put('/posts/text/:id', updatePostText)
routes.put('/posts/img/:id', updatePostImg)
routes.delete('/posts/:id', deletePost)
routes.put('/posts/likes/:id', incrementPostLikes)
routes.put('/posts/dislikes/:id', decrementPostLikes)
