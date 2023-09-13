import express from 'express';

import { prisma } from '../utils/prisma/index.js'
import authMiddleware from '../middlewares/auth.js';

const router = express.Router()

// 게시글 작성 API
router.post('/posts', authMiddleware, async (req, res, next) => {
    // 1. 게시글을 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
    // >> authMiddleware 를 통해 로그인 사용자인지 검증함.
    const { userId } = req.user

    // 2. 게시글 생성을 위한 `title`, `content`를 **body**로 전달받습니다.
    const { title, content } = req.body

    // 3. **Posts** 테이블에 게시글을 생성합니다.
    const post = await prisma.posts.create({
        data: {
            UserId: userId,
            title,
            content
        }
    })
    return res.status(201).json({ data: post })
})

// 게시글 조회 API
router.get('/posts', async (req, res, next) => {
    const posts = await prisma.posts.findMany({
        select: {
            postId: true,
            title: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return res.status(200).json({ data: posts })
})


// 게시글 상세 조회 API
router.get('/posts/:postId', async (req, res, next) => {
    const { postId } = req.params
    const post = await prisma.posts.findFirst({
        where: { postId: + postId },
        select: {
            postId: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true
        }
    })
    return res.status(200).json({ data: post })
})


// 게시글 수정 API
router.put('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { postId } = req.params;
        const { title, content } = req.body;

        const post = await prisma.posts.findUnique({
            where: { postId: +postId },
        });

        if (post["UserId"] !== userId) {

            return res.status(403).json({ errorMessage: '게시글 수정 권한이 없습니다' });
        }

        if (!post) {

            return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
        }


        // 게시글 수정.
        await prisma.posts.update({
            data: {
                title, content
            },
            where: {
                postId: +postId,
            },
        });

        return res.status(200).json({ data: '게시글이 수정되었습니다.' });
    } catch (err) {

        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// 게시글 삭제 API - DELETE
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    try {
      const { postId } = req.params;
  
      // 해당 postId와 일치하는 게시글을 조회
      const post = await prisma.posts.findUnique({
        where: { postId: +postId },
      });
  
      if (!post) {
        return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
      }
  
      // 게시글 삭제
      await prisma.posts.delete({
        where: { postId: +postId },
      });
  
      return res.status(200).json({ message: '게시글이 삭제되었습니다.' });
    } catch (err) {

      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  });

export default router;