import express from 'express';

import { prisma } from '../utils/prisma/index.js'
import authMiddleware from '../middlewares/auth.js';

const router = express.Router()

router.get('/users', authMiddleware, async (req, res, next) => {
    // 1. 클라이언트가 **로그인된 사용자인지 검증**합니다.
    const { userId } = req.user

    // 2. 사용자를 조회할 때, Users 테이블을 조회합니다.
    const user = await prisma.users.findFirst({
        where: { userId: +userId },
        // 특정 컬럼만 조회하는 파라미터
        select: { // 설정하지 않는 키는 기본적은 faluse
            nickname: true,
            createdAt: true
        }
    })

    // 3. 조회한 사용자의 상세한 정보를 클라이언트에게 반환합니다.
    return res.status(200).json({ data: user })
})

export default router