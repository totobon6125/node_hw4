import express from 'express';

import { prisma } from '../utils/prisma/index.js'
import authMiddleware from '../middlewares/auth.js';

const router = express.Router()

// 댓글 생성 API
router.post('/posts/:postId/comments', authMiddleware, async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user;
    const { content } = req.body;

    const post = await prisma.posts.findFirst({
        where: {
            postId: +postId,
        },
    });

    if (!post)
        return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

    const comment = await prisma.comments.create({
        data: {
            UserId: +userId, // 댓글 작성자 ID
            PostId: +postId, // 댓글 작성 게시글 ID
            content: content,
        },
    });

    return res.status(201).json({ data: comment });
},
);


// 댓글 조회 API
router.get('/posts/:postId/comments', async (req, res, next) => {
    const { postId } = req.params;

    const post = await prisma.posts.findFirst({
        where: {
            postId: +postId,
        },
    });

    if (!post)
        return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

    const comments = await prisma.comments.findMany({
        where: {
            PostId: +postId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return res.status(200).json({ data: comments });
});


// 댓글 수정 API
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { commentId } = req.params
        const { content } = req.body

        const putComment = await prisma.comments.findUnique({
            where: { commentId: +commentId },
        });

        if (!putComment) {

            return res.status(404).json({ errMessage: '댓글이 존재하지 않습니다.' });
        }

        await prisma.comments.update({
            data: {
                content
            },
            where: {
                commentId: +commentId,
            },
        });

        return res.status(200).json({ message: '댓글이 수정되었습니다.' });
    } catch (err) {

        res.status(500).json({ message: "데이터 형식이 올바르지 않습니다." })
    }
});

// 댓글 삭제 API - DELETE
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
    const { commentId } = req.params;


    const delComment = await prisma.comments.findFirst({
        where: { commentId: +commentId }
    });

    if (!delComment) {
        return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    await prisma.comments.delete({ where: { commentId: +commentId } });

    return res.status(200).json({ data: '게시글이 삭제되었습니다.' });
});


export default router;