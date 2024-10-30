import express from 'express'
import { Kafka } from 'kafkajs'
import dotenv from 'dotenv'
import WebSocket, { WebSocketServer } from 'ws'
import http from 'http'

// npx ts-node src/server.js

// Kafka Consumer: The backend consumes messages from response-topic and broadcasts them via WebSocket.
// WebSocket Server: A WebSocket server is set up, and when a new message is consumed, it is sent to all connected clients in real-time.

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

// Kafka configuration
const kafka = new Kafka({
  clientId: 'ai-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
})
const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'llm-service-group' })

// Middleware
app.use(express.json())

// HTTP endpoint to receive prompt requests
app.post('/api/generate', async (req, res) => {
  const { input } = req.body

  try {
    await producer.connect()
    await producer.send({
      topic: 'generate-text',
      messages: [{ value: JSON.stringify({ input }) }],
    })
    await producer.disconnect()

    res.status(202).send({ message: 'Request is being processed' })
  } catch (error) {
    console.error('Error sending to Kafka:', error)
    res.status(500).send({ error: 'Failed to process request' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// Set up HTTP server and WebSocket server
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket')

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket')
  })
})

// Start Kafka consumer to listen on `response-topic`
const startConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: 'response-topic', fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      const responseText = message.value ? message.value.toString() : ''
      console.log(`Received message: ${responseText}`)

      // Broadcast message to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ response: responseText }))
        }
      })
    },
  })
}

startConsumer().catch(console.error)
