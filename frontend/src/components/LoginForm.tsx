// frontend/src/components/LoginForm.tsx
import React, { useState } from 'react'
import { login } from '../services/authService'
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await login(username, password)
      localStorage.setItem('token', response.data.token)
      alert('Login successful')
    } catch (error) {
      alert('Invalid credentials')
    }
  }

  return (
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
          Login
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
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginForm
