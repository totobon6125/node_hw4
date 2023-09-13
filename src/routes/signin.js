import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../utils/prisma/index.js'
const router = express.Router()

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
    // 1. `nickname`, `password`를 **body**로 전달받습니다.
    const { nickname, password } = req.body

    // 2. 전달 받은 `nickname`에 해당하는 사용자가 있는지 확인합니다.
    const user = await prisma.users.findFirst({ where: { nickname } })
    if (!user) {
        return res.status(401).json({ errMsg: 'nickname 이 존재하지 않습니다.' })
    }

    // 3. 전달 받은 `password`와 데이터베이스의 저장된 `password`를 bcrypt를 이용해 검증합니다.
    if (!await bcrypt.compare(password, user.password)) {
        // 입력값     db에 저장 값
        return res.status(401).json({ errMsg: '비밀번호가 일치하지 않습니다.' })
    }

    // 4. 로그인에 성공한다면, 사용자에게 JWT를 발급합니다.
    const token = jwt.sign(
        {
            userId: user.userId  // 입력값 : db 저장 값
        },
        process.env.jwt_key //비밀키로 .env에 넣어야 함.
        )

    res.cookie('authorization', `Bearer ${token}`)
    // 형식           백틱으로 처리함-빈공간 필요
    return res.status(200).json({msg: '로그인에 성공했습니다.'})
})

export default router;