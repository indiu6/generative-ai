// JWT(JSON Web Token)를 사용하여 사용자 인증을 수행하는 미들웨어입니다. 주로 보호된 라우트에서 사용되어 요청에 포함된 JWT가 유효한지 확인하고, 유효하지 않은 경우 접근을 차단하는 역할을 합니다.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// authenticate 함수는 Express의 미들웨어로, 요청(req), 응답(res), 그리고 다음 미들웨어로 이동시키기 위한 next 함수를 매개변수로 받습니다.
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // split(' ')[1]을 사용해 실제 토큰 값만 추출
    // 일반적으로 Authorization 헤더에는 "Bearer [토큰]" 형식으로 전달되므로, split(' ')[1]을 통해 Bearer 이후의 토큰만 가져옵니다.
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // 검증이 성공할 경우 decoded에 JWT의 페이로드가 저장됩니다. 여기서 userId를 추출하여 요청 객체에 userId 속성으로 추가합니다. (req as any).userId = (decoded as any).userId;는 TypeScript에서 타입을 일시적으로 무시하여 속성을 추가하기 위해 사용됩니다.
        (req as any).userId = (decoded as any).userId;

        // 검증이 성공하면 next()를 호출하여 다음 미들웨어나 라우트 핸들러로 요청을 전달합니다. 이때 요청 객체에 추가된 userId 정보를 다른 미들웨어나 핸들러에서 사용할 수 있게 됩니다.
        next();
    });
};
