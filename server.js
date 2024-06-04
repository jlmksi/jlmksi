const WebSocket = require('ws');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Firebase 초기화
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://restaurant-order-9fd1f.firebaseio.com"
});

const db = firebaseAdmin.database();
const ordersRef = db.ref('/orders');

// WebSocket 서버 생성
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    const order = JSON.parse(message);

    // 주문 데이터 Firebase에 저장
    const newOrderRef = ordersRef.push();
    newOrderRef.set(order);

    // 모든 클라이언트에게 주문 데이터 전송
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(order));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is listening on port 8080');
