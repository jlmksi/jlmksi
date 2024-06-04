const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket server is running');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

let savedOrders = [];

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.request && data.request === 'savedOrders') {
      ws.send(JSON.stringify(savedOrders));
    } else if (data.request && data.request === 'cancelOrder') {
      savedOrders.splice(data.index, 1);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(savedOrders));
        }
      });
    } else {
      savedOrders.push(data);
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
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
