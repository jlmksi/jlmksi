const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsupybqyhijihabqcyx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  ws.on('message', async message => {
    const data = JSON.parse(message);

    try {
      if (data.request === 'savedOrders') {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*');
        if (error) throw error;

        ws.send(JSON.stringify({ action: 'savedOrders', orders }));
      } else if (data.action === 'delete') {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('orders')
          .insert([data]);
        if (error) throw error;

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: 'newOrder', order: data }));
          }
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ action: 'error', message: error.message }));
    }
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
