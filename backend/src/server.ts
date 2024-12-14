import express, { Request, Response } from 'express'
import { Kafka, Partitioners, Admin, Consumer, Producer } from 'kafkajs'
import dotenv from 'dotenv'
import WebSocket, { WebSocketServer, WebSocket as WSClient } from 'ws'
import http, { Server as HTTPServer } from 'http'
import cors from 'cors'
// import authRoutes from './routes/authRoutes';

// npx ts-node src/server.js

// Kafka Consumer: The backend consumes messages from response-topic and broadcasts them via WebSocket.
// WebSocket Server: A WebSocket server is set up, and when a new message is consumed, it is sent to all connected clients in real-time.

dotenv.config()

const app = express()

// Add CORS middleware
app.use(cors({
    origin: 'http://localhost:3000', // 프론트엔드 주소
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 메서드들
    credentials: true, // 쿠키 등을 포함한 인증 정보 허용
}));

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

//! JWT Auth route
// app.use('/auth', authRoutes);

// HTTP endpoint to receive prompt requests
app.post('/api/generate', async (req: Request<{}, {}, { input: string }>, res: Response) => {
    const { input } = req.body;

    try {
        // Send input to Kafka topic
        await producer.connect()
        await producer.send({
            topic: 'generate-text',
            // 여기서 JSON.stringify({ input })는 input 값을 객체의 속성으로 포함하는 JSON 문자열을 생성합니다. 예를 들어, input 값이 "hello"라면, JSON.stringify({ input })는 {"input":"hello"}라는 문자열을 생성합니다.
            // 이렇게 하는 이유는 Kafka 메시지의 구조를 명확히 하기 위해서입니다. 메시지를 받을 때, input이라는 속성명을 통해 값을 쉽게 접근할 수 있습니다.
            // 반면, JSON.stringify(input)를 사용하면 input 값 자체가 JSON 문자열로 변환되지만, 속성명이 없어 메시지 구조가 불명확해질 수 있습니다.
            messages: [{ value: JSON.stringify({ input }) }],
        })
        await producer.disconnect()

        res.status(202).send({ message: 'Request is being processed' })
    } catch (error: unknown) {
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
        // falsy 값(예: undefined, null, 빈 문자열, false, 0)
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
    } catch (error: unknown) {
        console.error('Error setting topic configuration:', error)
    } finally {
        try {
            await admin.disconnect()
        } catch (disconnectError: unknown) {
            console.error('Error disconnecting Kafka admin client:', disconnectError)
        }
    }
}

// Start Kafka consumer to listen on `response-topic`
const startConsumer = async (): Promise<void> => {
    try {
        await consumer.connect()
        await consumer.subscribe({ topic: 'response-topic', fromBeginning: false })
    } catch (error: unknown) {
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
                } catch (processError: unknown) {
                    console.error('Error processing Kafka message:', processError)
                }
            },
        })
    } catch (error: unknown) {
        console.error('Error running Kafka consumer:', error)
    }
}

// Initialize topic configuration and consumer
configureTopicRetention().catch((error: unknown) => {
    console.error('Error configuring topic retention:', error)
})
startConsumer().catch((error: unknown) => {
    console.error('Error starting Kafka consumer:', error)
})
