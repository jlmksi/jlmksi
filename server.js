const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsupybqyhijihabqcyx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc3VweWJxeWhpamloYWJxY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1Mjk3MzMsImV4cCI6MjAzMzEwNTczM30.OdQODIBP918QRVWoKtQi6dr41HGnWyva7ajWWe0FJ4g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  ws.on('message', async message => {
    const data = JSON.parse(message);

    if (data.request === 'savedOrders') {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*');
      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }
      ws.send(JSON.stringify({ action: 'savedOrders', orders }));
    } else if (data.action === 'delete') {
      await supabase
        .from('orders')
        .delete()
        .eq('id', data.id);
    } else if (data.action === 'reset') {
      await supabase
        .from('orders')
        .delete()
        .neq('id', 0); // Deletes all orders
      broadcastSavedOrders();
    } else {
      const { error } = await supabase
        .from('orders')
        .insert([data]);
      if (error) {
        console.error('Error inserting order:', error);
        return;
      }
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'newOrder', order: data }));
        }
      });
    }
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

async function broadcastSavedOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*');
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ action: 'savedOrders', orders }));
    }
  });
}
