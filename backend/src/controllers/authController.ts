// **JWT(JSON Web Token)**를 사용하여 로그인 성공 시 인증 토큰을 생성하여 반환
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await User.create({ username, password });

    console.log('User registered successfully', user);

    res.json({ message: 'User registered successfully', user });
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await user.validatePassword(password))) {
        // return res.status(401).json({ message: 'Invalid credentials' });
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    console.log('User logged in successfully', user);
    console.log('Token:', token);

    res.json({ message: 'Login successful', token, userId: user.id });
};
