import jwt from 'jsonwebtoken';

import { prisma } from '../utils/prisma/index.js'

export default async function (req, rse, next) {
    try {    // 1. 클라이언트로 부터 **쿠키(Cookie)**를 전달받습니다.
        const { authorization } = req.cookies

        // 2. **쿠키(Cookie)**가 **Bearer 토큰** 형식인지 확인합니다.
        const [tokenType, token] = authorization.split(" ")
        if (tokenType !== 'Bearer') {
            throw new Error('토큰 타입이 일치하지 않습니다.')
        }

        // 3. 서버에서 발급한 **JWT가 맞는지 검증**합니다.
        const decodedToken = jwt.verify(token, process.env.jwt_key) //8번에서 할당받은 토큰을 가져와서 '비밀키' 와 일치하는 지 검증함
        const userId = decodedToken.userId

        // 4. JWT의 `userId`를 이용해 사용자를 조회합니다.
        const user = await prisma.users.findFirst({
            where: {userId: +userId}
        })
        if(!user) {
            res.clearCookie('authorization')
            throw new Error('토큰 사용자가 존재하지 않습니다')
        }

        // 5. `req.user` 에 조회된 사용자 정보를 할당합니다.
        req.user = user;

        // 6. 다음 미들웨어를 실행합니다.
        next();

    } catch (error) {
        res.clearCookie('authorization')

        switch (error.name) {
            case 'TokenExpiredError': // 토큰이 만료되었을 때 나오는 에러

                return res.staus(401).json({ errMsg: '토큰이 만료 되었습니다.' })

            case 'JsonWebTokenError': // 토큰에 검증이 실패했을 대 발생하는 에러

                return res.staus(401).json({ errMsg: '토큰 검증에 실패했습니다' })

            default:

                return res.staus(401).json({ errMsg: error.message ?? '비정상적인 요청입니다.' })  // 그 외 오류시 등장
        }

    }
}