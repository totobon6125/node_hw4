import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma/index.js'

const router = express.Router()


// 회원 가입 API
router.post('/sign-up', async (req, res, next) => {
  // 1. `nickname`, `password`, `confirm`를 **body**로 전달받습니다.
  const { nickname, password, confirm } = req.body

  // 2. 동일한 `nickname`을 가진 사용자가 database에 있는지 확인합니다.
  const isExistNickName = await prisma.users.findFirst({
    where: { nickname },
  })

  // 유효성 검사
  if (isExistNickName) {

    return res.status(409).json({ errMsg: '중복된 nickname 입니다.' })
  }

  // nickname 대소문자 상관없이 영문과 숫자 섞어서 3자리 이상
  const nicknameRegex = new RegExp(/^(?=.*[a-zA-Z])(?=.*[0-9]).{3,}$/i);

  // password 대소문자 상관없이 영문과 숫자 섞어서 4자리 이상
  const passwordRegex = new RegExp(/^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/i);

  // password 안에 nickname 이 포함되면 안됨.
  if (!nicknameRegex.test(nickname)) {

    return res.status(400).json({ errMsg: 'nickname 조건에 맞지 않습니다.' })
  }

  if (!passwordRegex.test(password)) {

    return res.status(400).json({ errMsg: 'password 조건에 맞지 않습니다.' })
  }

  if (password.includes(nickname)) {

    return res.status(400).json({ errMsg: 'password 안에 nickname 이 있습니다.' })
  }

  if (password !== confirm) {

    return res.status(400).json({ errMsg: '확인용 password 가 틀렸습니다.' })
  }


  // 3. **Users** 테이블에 `nickname`, `password`, `confirm`를 이용해 사용자를 생성합니다.

  // bcrypt 로 password 암호화 하기
  const hashedpassword = await bcrypt.hash(password, 10); //
  const user = await prisma.users.create({
    data: {
      nickname,
      password : hashedpassword,
      confirm :  hashedpassword
    }
  })

  return res.status(201).json({msg: '회원가입이 되었습니다.'})
})


export default router;