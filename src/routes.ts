import express from 'express'
import {
    deleteUser,
    indexUser,
    indexUserById,
    storeUser,
    updateUser,
} from './controllers/UserController'
import {
    addPostResponse,
    decrementPostLikes,
    deletePost,
    deletePostResponse,
    incrementPostLikes,
    indexPost,
    indexPostById,
    storePost,
    updatePostImg,
    updatePostResponse,
    updatePostText,
    updatePostTitle,
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
routes.put('/posts/title/:id', updatePostTitle)
routes.delete('/posts/:id', deletePost)
routes.put('/posts/likes/:id', incrementPostLikes)
routes.put('/posts/dislikes/:id', decrementPostLikes)
routes.post('/posts/response/:id/:userId', addPostResponse)
routes.put('/posts/response/:id/:responseId', updatePostResponse)
routes.delete('/posts/response/:id/:responseId', deletePostResponse)
