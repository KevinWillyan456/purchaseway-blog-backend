import express from 'express'
import {
    deleteUser,
    indexUser,
    indexUserById,
    login,
    verifyToken,
    getUserByToken,
    getUserInfo,
    getUserPosts,
    storeUser,
    updateUser,
} from './controllers/UserController'
import {
    addPostResponse,
    deletePost,
    deleteAllPosts,
    deletePostResponse,
    togglePostLikes,
    indexPost,
    indexPostById,
    storePost,
    updatePost,
    updatePostResponse,
    togglePostResponseLikes,
} from './controllers/PostController'

export const routes = express.Router()

routes.get('/users', indexUser)
routes.get('/users/:id', indexUserById)
routes.post('/users', storeUser)
routes.put('/users/:id', updateUser)
routes.delete('/users/:email', deleteUser)
routes.post('/login', login)
routes.post('/verify-token', verifyToken)
routes.get('/get-user-by-token', getUserByToken)
routes.get('/get-user-info', getUserInfo)
routes.get('/get-user-posts', getUserPosts)

routes.get('/posts', indexPost)
routes.get('/posts/:id', indexPostById)
routes.post('/posts/:userId', storePost)
routes.put('/posts/:id/:userId', updatePost)
routes.delete('/posts/:id/:userId', deletePost)
routes.delete('/delete-all-posts/:userId', deleteAllPosts)
routes.put('/posts/likes/:id/:userId', togglePostLikes)
routes.post('/posts/response/:id/:userId', addPostResponse)
routes.put('/posts/response/:id/:responseId/:userId', updatePostResponse)
routes.put(
    '/posts/response/likes/:id/:responseId/:userId',
    togglePostResponseLikes
)
routes.delete('/posts/response/:id/:responseId/:userId', deletePostResponse)
