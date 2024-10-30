import express, { Request, Response } from 'express'
import { Kafka, Partitioners, Admin, Consumer, Producer } from 'kafkajs'
import dotenv from 'dotenv'
import WebSocket, { WebSocketServer, WebSocket as WSClient } from 'ws'
import http, { Server as HTTPServer } from 'http'

// npx ts-node src/server.js

// Kafka Consumer: The backend consumes messages from response-topic and broadcasts them via WebSocket.
// WebSocket Server: A WebSocket server is set up, and when a new message is consumed, it is sent to all connected clients in real-time.

dotenv.config()

const app = express()
const port: string | number = process.env.PORT || 8080

// Kafka configuration
const kafka = new Kafka({
    clientId: 'ai-backend',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
})
const producer: Producer = kafka.producer()
const consumer: Consumer = kafka.consumer({ groupId: 'llm-service-group' })
const admin: Admin = kafka.admin()

// Middleware
app.use(express.json())

// HTTP endpoint to receive prompt requests
app.post('/api/generate', async (req: Request, res: Response) => {
    const { input }: { input: string } = req.body

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
const server: HTTPServer = http.createServer(app)
const wss: WebSocketServer = new WebSocketServer({ server })

// WebSocket connection handler
wss.on('connection', (ws: WSClient) => {
    console.log('Client connected to WebSocket')

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket')
    })
})

// Function to configure Kafka topic retention policy
const configureTopicRetention = async (): Promise<void> => {
    await admin.connect()
    try {
        const topicsMetadata = await admin.fetchTopicMetadata({ topics: ['generate-text'] });
        if (!topicsMetadata.topics.length) {
            await admin.createTopics({
                topics: [
                    {
                        topic: 'generate-text',
                        numPartitions: 1,
                        replicationFactor: 1,
                        configEntries: [
                            { name: 'retention.ms', value: '600000' },  // Set retention to 10 minutes
                        ],
                    },
                ],
            })
        }
        console.log('Kafka topic retention policy set to 10 minutes')
    } catch (error) {
        console.error('Error setting topic configuration:', error)
    } finally {
        await admin.disconnect()
    }
}

// Start Kafka consumer to listen on `response-topic`
const startConsumer = async (): Promise<void> => {
    await consumer.connect()
    await consumer.subscribe({ topic: 'response-topic', fromBeginning: false })

    await consumer.run({
        eachMessage: async ({ message }) => {
            const responseText: string = message.value ? message.value.toString() : ''
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

// Initialize topic configuration and consumer
configureTopicRetention().catch(console.error)
startConsumer().catch(console.error)
