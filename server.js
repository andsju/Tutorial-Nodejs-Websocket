import WebSocket,  {WebSocketServer } from 'ws';
import { parse } from './libs/functions.js';

// create WebSocket server
const wss = new WebSocketServer({ port: 8081 });

// listen to WebSocket Server (wss) connections
wss.on('connection', (ws) => {
    console.log('Client connected from IP: ', ws._socket.remoteAddress);
    console.log('Number of connected clients: ', wss.clients.size);

    // WebSocket events (ws) for a single client
    // --------------------

    // close event
    ws.on('close', () => {
        console.log('Client disconnected\n');
        let objReply = {
            type: "message",
            data: "Another client disconnected"
        }
        wss.broadcastButExclude(JSON.stringify(objReply), ws);
    });

    // message event
    ws.on('message', (data) => {
        let obj = parse(data);
        console.log('Message received: %O', obj);

        // use property 'type' to handle message event
        switch (obj.type) {
           
            case "chat":
                wss.broadcastButExclude(JSON.stringify(obj), ws);
                break;
            default:
                console.log("Message type is:", obj.type)
                break;
        }

    });
});

// broadcast function
wss.broadcast = function (data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// broadcast function exclude a websocket client
wss.broadcastButExclude = function (data, someClient) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (client !== someClient) {
                client.send(data);
            }
        }
    });
}