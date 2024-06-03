const WebSocket = require('ws');
const http = require('http');
const admin = require('firebase-admin');
const fs = require('fs');

// 환경 변수에서 서비스 계정 키 읽기
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'your-firebase-storage-bucket.appspot.com' // Firebase Storage 버킷 이름
});

const bucket = admin.storage().bucket();
const ordersFilePath = 'orders.json';

// Load existing orders from Firebase Storage
let savedOrders = [];
async function loadOrders() {
    try {
        const file = bucket.file(ordersFilePath);
        const [exists] = await file.exists();
        if (exists) {
            const data = await file.download();
            savedOrders = JSON.parse(data.toString());
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Save orders to Firebase Storage
async function saveOrders() {
    try {
        const file = bucket.file(ordersFilePath);
        await file.save(JSON.stringify(savedOrders, null, 2));
        console.log('Orders saved to Firebase Storage');
    } catch (error) {
        console.error('Error saving orders:', error);
    }
}

// Load orders on server start
loadOrders();

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('WebSocket server is running');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
        const data = JSON.parse(message);

        if (data.request && data.request === 'savedOrders') {
            ws.send(JSON.stringify(savedOrders));
        } else {
            const timestamp = new Date().toISOString();
            data.timestamp = timestamp;
            savedOrders.push(data);
            saveOrders();

            // Broadcast the message to all clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(savedOrders));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
