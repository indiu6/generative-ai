import React, { useState, useEffect } from 'react'
import { Container, Box, Typography } from '@mui/material'
import FormTest from './components/FormTest'
import ChatMessages from './components/ChatMessages'
import MessageForm from './components/MessageForm'
import axios from 'axios'

type Message = {
  role: 'user' | 'bot'
  content: string
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

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
      // Handle each WebSocket message as a streaming chunk
      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)

          if (data.response) {
            setMessages((prevMessages) => {
              // If last message is from the bot, update its content
              if (
                prevMessages.length > 0 &&
                prevMessages[prevMessages.length - 1].role === 'bot'
              ) {
                const updatedMessages = [...prevMessages]
                updatedMessages[updatedMessages.length - 1].content +=
                  data.response
                return updatedMessages
              } else {
                // Otherwise, add a new bot message
                return [
                  ...prevMessages,
                  { role: 'bot', content: data.response },
                ]
              }
            })
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

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return // Prevent empty submissions

    // Add user's message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: input },
    ])
    setLoading(true)

    try {
      await axios.post('/api/generate', { input })
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
    <>
      {/* <LoginForm onSuccess={handleLoginSuccess} /> */}
      {/* <LoginForm /> */}
      <FormTest />

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

          <ChatMessages messages={messages} loading={loading} />
          <MessageForm handleSendMessage={handleSendMessage} />
        </Container>
      </Box>
    </>
  )
}

export default App
