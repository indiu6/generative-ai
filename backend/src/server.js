import express from 'express'
import { Kafka } from 'kafkajs'
import dotenv from 'dotenv'

// npx ts-node src/server.js

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

// Kafka configuration
const kafka = new Kafka({
  clientId: 'ai-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
})
const producer = kafka.producer()

app.use(express.json())

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
