import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material'

type Message = {
  role: 'user' | 'bot'
  content: string
}

const App: React.FC = () => {
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // Establish WebSocket connection to the backend
    const socket = new WebSocket('ws://localhost:8081')

    socket.onopen = () => {
      console.log('Connected to WebSocket server')
    }

    // Listen for responses from WebSocket
    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        // Check if data contains the `response` key
        if (data.response) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'bot', content: data.response },
          ])
        } else {
          console.warn("Received message without 'response' key:", data)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server')
    }

    // Cleanup WebSocket connection on component unmount
    return () => {
      socket.close()
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!input.trim()) return // Prevent empty submissions

    // Add user's message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: input },
    ])

    setLoading(true)

    try {
      await axios.post('/api/generate', { input })
      setInput('') // Clear the input field after submission
    } catch (error) {
      console.error('Error fetching response:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'bot', content: 'An error occurred.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container
      maxWidth="sm"
      style={{ paddingTop: '20px', fontFamily: 'Arial, sans-serif' }}
    >
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Generative AI Playground
      </Typography>

      <Paper
        variant="outlined"
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '10px',
          marginBottom: '20px',
        }}
      >
        {messages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="body1" color="textSecondary">
              Welcome! Type a question below to start chatting with the AI.
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              marginY={1}
            >
              <Paper
                elevation={2}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F1F0F0',
                  maxWidth: '80%',
                }}
              >
                <Typography variant="body1" color="textPrimary">
                  {msg.content}
                </Typography>
              </Paper>
            </Box>
          ))
        )}

        {loading && (
          <Box display="flex" justifyContent="center" paddingY={1}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Paper>

      <Box component="form" onSubmit={handleSubmit} display="flex" gap={1}>
        <TextField
          variant="outlined"
          placeholder="Message ChatGPT.."
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Container>
  )
}

export default App
