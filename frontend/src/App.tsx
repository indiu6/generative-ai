import React, { useState, useEffect, useRef } from 'react'
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
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'bot'
  content: string
}

const App: React.FC = () => {
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // Determine WebSocket protocol based on environment
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${wsProtocol}://${
        process.env.REACT_APP_WEBSOCKET_URL || 'localhost:8081'
      }`

      // Establish WebSocket connection
      const socket = new WebSocket(wsUrl)

      console.log('Attempting to connect to WebSocket:', socket.url)

      // WebSocket connection opened
      socket.onopen = () => {
        console.log('Connected to WebSocket server at:', socket.url)
      }

      // Listen for responses from WebSocket
      socket.onmessage = (event: MessageEvent) => {
        try {
          console.log('Raw message received from WebSocket:', event.data)
          const data = JSON.parse(event.data)

          if (data.response) {
            console.log("Message received with 'response' key:", data.response)
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

      // WebSocket connection closed
      socket.onclose = (event) => {
        console.log('WebSocket connection closed')
        console.log(`Close event: Code ${event.code}, Reason: ${event.reason}`)
        if (event.wasClean) {
          console.log('Connection closed cleanly.')
        } else {
          console.error('Connection closed abruptly. Code:', event.code)
        }
      }

      // WebSocket error handling
      socket.onerror = (error) => {
        console.error('WebSocket error observed:', error)
        if (error instanceof Event) {
          console.error('WebSocket error event details:', error)
        }
      }

      // Cleanup WebSocket connection on component unmount
      return () => {
        console.log('Closing WebSocket connection')
        socket.close()
      }
    } catch (error) {
      console.error('Error in WebSocket configuration:', error)
    }
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      style={{ backgroundColor: '#f0f0f5' }} // Optional background color for the whole view
    >
      <Container
        maxWidth="sm"
        style={{
          paddingTop: '20px',
          paddingBottom: '20px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f9f9fb',
          borderRadius: '8px',
        }}
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
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
                    backgroundColor:
                      msg.role === 'user' ? '#f6e6d8' : '#e8e8e8',
                    maxWidth: '80%',
                    transition: 'transform 0.2s ease',
                  }}
                  className="message"
                >
                  <Typography variant="body1" color="textPrimary">
                    {msg.role === 'bot' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
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

          <div ref={messagesEndRef} />
        </Paper>

        <Box component="form" onSubmit={handleSubmit} display="flex" gap={1}>
          <TextField
            variant="outlined"
            placeholder="Message ChatGPT..."
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ backgroundColor: '#ffffff', borderRadius: '4px' }}
          />
          <Button
            type="submit"
            variant="contained"
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
            Send
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default App
