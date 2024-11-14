// Express의 Router를 사용하여 사용자 인증 관련 라우트를 정의하는 파일입니다. register와 login 같은 사용자 등록 및 로그인 기능을 제공하고, authenticate 미들웨어를 사용하여 보호된 라우트(/protected)에 대한 접근을 제어합니다.
import { Router } from 'express';
import { register, login } from '../controllers/authController';

// authMiddleware에서 authenticate 미들웨어를 불러옵니다. 이 미들웨어는 인증이 필요한 라우트에서 사용되어, 유효한 토큰이 있는 경우에만 접근할 수 있도록 보호합니다.
import { authenticate } from '../middlewares/authMiddleware';

// Router를 호출하여 새로운 라우터 객체 router를 생성합니다. 이 객체는 이후 각 라우트의 핸들러를 정의하고, 다른 파일에서 app.use로 불러와 사용할 수 있습니다.
const router = Router();

router.post('/register', register);
router.post('/login', login);

// /protected 라우트는 인증이 필요한 엔드포인트의 예시로, 실제 서비스에서는 사용자 정보를 조회하거나 민감한 데이터를 제공하는 라우트에 authenticate 미들웨어를 적용할 수 있습니다.
router.get('/protected', authenticate, (req, res) => {
    res.json({ message: 'You have accessed a protected route!' });
});

export default router;
