import express from 'express';

import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router()


// 좋아요 기능 생성 API
router.put('/:postId/likes', authMiddleware, async(req,res) => {
  try {
    const { postId } = req.params
    const { userId, aboutLike } = req.user 

    const post = await prisma.posts.findUnique({ where: { postId: +postId } })
    
    if (!post) {
        return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다' })
    }

    const [addLikes, substractLikes] = [post.likes+1, post.likes-1]
    
    if (!aboutLike.includes(`${postId} `)) {
      const aboutLike2 = aboutLike + postId + ' '

      await prisma.users.update({ data: { aboutLike: aboutLike2 }, where: { userId: userId }})
      await prisma.posts.update({ data: { likes: addLikes }, where: { postId: +postId } })
      

      return res.status(200).json({ message: '게시글의 좋아요를 등록하였습니다' })
    } else {
      const aboutLike2 = aboutLike.replaceAll(`${postId} `,'')

      await prisma.users.update({ data: { aboutLike: aboutLike2 }, where: { userId: userId }})
      await prisma.posts.update({ data: {likes: substractLikes}, where: { postId: +postId } })

      return res.status(200).json({ message: '게시글의 좋아요를 취소하였습니다' })
    }
  } catch (err) {
    return res.status(400).json({ errorMessage: '게시글 좋아요 추가/취소에 실패하였습니다' })
  }
})


// 좋아요 조회 API
router.get('/likes', authMiddleware, async(req,res) => {
  try {
    const { aboutLike } = req.user

    const favoritePosts = []
    console.log(aboutLike)
    let arr = aboutLike.split(' ')
    console.log(arr)
    for (let i=0; i<arr.length-1; i++) { 
      const post = await prisma.posts.findUnique({
        where: { postId: +arr[i] },
        select: {
          postId: true,
          UserId: true,
          Nickname: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          likes: true
        }
      })

      favoritePosts.push(post)
    }

    favoritePosts.sort((a,b) => b.likes-a.likes)

    return res.status(200).json({ posts: favoritePosts })
  } catch (err) {

    return res.status(400).json({ errorMessage: '좋아요 게시글 조회에 실패하였습니다' })
  }
})


export default router