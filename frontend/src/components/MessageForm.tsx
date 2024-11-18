import React, { useState } from 'react'
import { Box, TextField, Button } from '@mui/material'

interface MessageFormProps {
  handleSendMessage: (input: string) => void
}

const MessageForm: React.FC<MessageFormProps> = ({ handleSendMessage }) => {
  const [input, setInput] = useState<string>('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (input.trim()) {
      handleSendMessage(input)
      setInput('') // Clear the input
    }
  }

  return (
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
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b76b44')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d48a5f')}
      >
        Send
      </Button>
    </Box>
  )
}

export default MessageForm
