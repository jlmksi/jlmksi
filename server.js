const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./restaurant-order-9fd1f-firebase-adminsdk-fy5vk-4389fcc104.json');

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://restaurant-order-9fd1f.firebaseio.com'
});

const db = admin.database();
const ordersRef = db.ref('orders');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let orders = [];

ordersRef.on('value', snapshot => {
  orders = snapshot.val() || [];
  broadcastSavedOrders();
});

wss.on('connection', ws => {
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.request === 'savedOrders') {
      ws.send(JSON.stringify({ action: 'savedOrders', orders }));
    } else if (data.action === 'reset') {
      orders = [];
      ordersRef.set(orders);
      broadcastSavedOrders();
    } else if (data.action === 'delete') {
      orders.splice(data.index, 1);
      ordersRef.set(orders);
      broadcastSavedOrders();
    } else {
      data.timestamp = new Date().toISOString(); // 주문 시간 타임스탬프 추가
      orders.push(data);
      ordersRef.set(orders);
      broadcastNewOrder(data);
    }
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

function broadcastSavedOrders() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ action: 'savedOrders', orders }));
    }
  });
}

function broadcastNewOrder(order) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ action: 'newOrder', order }));
    }
  });
}
