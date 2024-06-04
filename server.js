const firebase = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://restaurant-order-9fd1f.firebaseio.com"
});

const db = firebase.database();
const ref = db.ref("/orders");

const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket server is running');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.action === 'newOrder') {
      ref.push(data.order);
    } else if (data.action === 'cancelOrder') {
      ref.child(data.orderId).remove();
    } else if (data.action === 'resetOrders') {
      ref.remove();
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});

ref.on('value', (snapshot) => {
  const orders = snapshot.val();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(orders));
    }
  });
});
