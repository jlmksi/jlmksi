const WebSocket = require('ws');
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json'); // 경로를 실제 파일 경로로 변경하세요.

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://restaurant-order-9fd1f.firebaseio.com'
});

const db = admin.database();
const ref = db.ref('orders');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ref.on('value', (snapshot) => {
    const orders = snapshot.val();
    ws.send(JSON.stringify(orders));
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.action === 'reset') {
      ref.remove();
    } else {
      const newOrderRef = ref.push();
      newOrderRef.set(data);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is listening on port 8080');
