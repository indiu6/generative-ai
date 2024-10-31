import React, { useState, useEffect } from 'react'
import axios from 'axios'

const App: React.FC = () => {
  const [input, setInput] = useState<string>('')
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // Establish WebSocket connection to the backend
    // const socket = new WebSocket('ws://localhost:8080')
    const socket = new WebSocket('ws://localhost:8081')

    socket.onopen = () => {
      console.log('Connected to WebSocket server')
    }

    // Listen for responses from WebSocket
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.response) {
        setResponse(data.response)
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
    setLoading(true)
    try {
      const result = await axios.post('/api/generate', { input })

      //   console.dir(`result: ${result}`)
      //   console.log(JSON.stringify(result, null, 2))

      //   setResponse(result.data.response)
      setResponse(result.data.message)

      //! why it's null in console
      console.log(`result.data.message: ${result.data.message}`)
    } catch (error) {
      console.error('Error fetching response:', error)
      setResponse('An error occurred.')
    }
    setInput('') // Clear input field after submission
    setLoading(false)
  }

  return (
    <div>
      <h1>Generative AI Service</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit">Generate</button>
      </form>
      {loading && <p>Loading...</p>}
      {response && <p>{response}</p>}
    </div>
  )
}

export default App
