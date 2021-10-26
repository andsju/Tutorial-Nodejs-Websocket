import { WebSocketServer } from 'ws';

// create WebSocket server
const wss = new WebSocketServer({ port: 8081 });

// listen to WebSocket server (wss) connections
wss.on('connection', (ws) => {
    console.log('Client connected from IP: ', ws._socket.remoteAddress);
    console.log('Number of connected clients: ', wss.clients.size);
    
    // WebSocket events (ws) for a single client
    // --------------------

    // close event
    ws.on('close', () => {
        console.log('Client disconnected\n');
    });
});