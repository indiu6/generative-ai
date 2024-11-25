// 프론트엔드에서 백엔드의 인증 관련 API를 호출하는 axios 서비스입니다. register 함수와 login 함수는 각각 회원가입과 로그인 요청을 처리하는 역할을 합니다.
import axios from 'axios';

const API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:8080/auth';


export const register = (username: string, password: string) => {
    return axios.post(`${API_URL}/register`, { username, password });
};

export const login = (username: string, password: string) => {
    return axios.post(`${API_URL}/login`, { username, password });
};