import express from 'express';

import UsersRouter from './users.js';
import PostsRouter from './posts.js';
import SignUpRouter from './signup.js';
import SignInRouter from './signin.js';
import CommentsRouter from './comments.js'
import LikesRouter from './likes.js'

const router = express.Router()

router.use('', [SignUpRouter, SignInRouter, UsersRouter, PostsRouter, CommentsRouter, LikesRouter])

export default router;