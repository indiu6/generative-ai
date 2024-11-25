// frontend/src/components/LoginForm.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../services/authService'
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await login(username, password)
      console.log('response.data.message: ', response?.data?.message)
      console.log('response.data.userId: ', response?.data?.userId)

      localStorage.setItem('token', response?.data?.token)
      alert('Login successful')
      navigate('/chat') // 로그인 후 채팅 화면으로 이동
    } catch (error) {
      alert('Invalid credentials')
      console.error('Login failed:', error)
    }
  }

  const handleRegister = async () => {
    try {
      const response = await register(username, password)
      console.log('response.data.message: ', response?.data?.message)

      alert('Registration successful! You can now log in.')
    } catch (error) {
      alert('Registration failed. Please try again.')
      console.error('Registration failed:', error)
    }
  }

  const handleGuestStart = () => {
    navigate('/chat') // 게스트로 시작할 때 채팅 화면으로 이동
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      style={{ backgroundColor: '#f0f0f5' }} // 전체 배경 색상
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#f9f9fb',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            Generative AI Play
          </Typography>
          <Box
            component="form"
            onSubmit={handleLogin}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              style={{ backgroundColor: '#ffffff', borderRadius: '4px' }}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              style={{ backgroundColor: '#ffffff', borderRadius: '4px' }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              style={{
                backgroundColor: '#d48a5f',
                color: '#ffffff',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = '#b76b44')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = '#d48a5f')
              }
            >
              Login
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleRegister}
              style={{
                borderColor: '#d48a5f',
                color: '#d48a5f',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = '#f7e4d9')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              Register
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={handleGuestStart}
              style={{ color: '#888888' }}
            >
              Continue as Guest
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default LoginForm
