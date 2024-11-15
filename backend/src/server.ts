import express, { Request, Response } from 'express'
import { Kafka, Partitioners, Admin, Consumer, Producer } from 'kafkajs'
import dotenv from 'dotenv'
import WebSocket, { WebSocketServer, WebSocket as WSClient } from 'ws'
import http, { Server as HTTPServer } from 'http'
import cors from 'cors'
import authRoutes from './routes/authRoutes';

// npx ts-node src/server.js

// Kafka Consumer: The backend consumes messages from response-topic and broadcasts them via WebSocket.
// WebSocket Server: A WebSocket server is set up, and when a new message is consumed, it is sent to all connected clients in real-time.

dotenv.config()

const app = express()
const port: number = parseInt(process.env.PORT || '8080', 10);
const wsPort: number = parseInt(process.env.WS_PORT || '8081', 10);

// Kafka configuration
const kafka = new Kafka({
    clientId: 'ai-backend',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
})
const producer: Producer = kafka.producer()
const consumer: Consumer = kafka.consumer({ groupId: 'llm-service-group' })
const admin: Admin = kafka.admin()

// Middleware
app.use(express.json())
app.use('/auth', authRoutes);

// HTTP endpoint to receive prompt requests
app.post('/api/generate', async (req: Request, res: Response) => {
    const { input }: { input: string } = req.body

    try {
        // Send input to Kafka topic
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

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

// Set up HTTP server and WebSocket server
const server: HTTPServer = http.createServer(app)
// Attach WebSocket server to HTTP server
// const wss: WebSocketServer = new WebSocketServer({ server })
const wss: WebSocketServer = new WebSocketServer({ port: wsPort })

// WebSocket connection handler
wss.on('connection', (ws: WSClient) => {
    console.log('Client connected to WebSocket')

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket')
    })
})

// Start WebSocket server
wss.on('listening', () => {
    console.log(`WebSocket server is running on port ${wsPort}`);
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error)
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
        try {
            await admin.disconnect()
        } catch (disconnectError) {
            console.error('Error disconnecting Kafka admin client:', disconnectError)
        }
    }
}

// Start Kafka consumer to listen on `response-topic`
const startConsumer = async (): Promise<void> => {
    try {
        await consumer.connect()
        await consumer.subscribe({ topic: 'response-topic', fromBeginning: false })
    } catch (error) {
        console.error('Error connecting Kafka consumer:', error)
        return
    }

    try {
        await consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const responseText: string = message.value ? message.value.toString() : ''
                    console.log(`Received responseText: ${responseText}`)

                    // Broadcast message to all WebSocket clients
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(responseText)
                        }
                    })
                } catch (processError) {
                    console.error('Error processing Kafka message:', processError)
                }
            },
        })
    } catch (error) {
        console.error('Error running Kafka consumer:', error)
    }
}

// Initialize topic configuration and consumer
configureTopicRetention().catch((error) => {
    console.error('Error configuring topic retention:', error)
})
startConsumer().catch((error) => {
    console.error('Error starting Kafka consumer:', error)
})
