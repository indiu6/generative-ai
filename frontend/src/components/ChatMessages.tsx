import React, { useRef, useEffect } from 'react'
import { Box, Paper, Typography, CircularProgress } from '@mui/material'
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'bot'
  content: string
}

interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
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
                backgroundColor: msg.role === 'user' ? '#f6e6d8' : '#e8e8e8',
                maxWidth: '80%',
                transition: 'transform 0.2s ease',
              }}
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
  )
}

export default ChatMessages
