const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let orders = [];

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (message) => {
        const order = JSON.parse(message);
        orders.push(order);

        // Broadcast the new order to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(order));
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
