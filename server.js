import express from 'express';
import http from 'http';
import WebSocket,  {WebSocketServer } from 'ws';
import { parse } from './libs/functions.js';

const app = express();
const port = process.env.PORT || 8081;

app.use(express.static('public'));

import session from 'express-session';

app.use(session({
    secret: "foryoureyesonly%tXl!p",
    resave: false,
    saveUninitialized: true
}));


// session using a variable - just for development
let browserSession;

// let express handle form data as json 
app.use(express.json());

// route ajax post
app.post('/authenticate', (req, res) => {
       
    let result;
    if (["Pippin", "Merry", "Sam"].includes(req.body.nickname)) {
        result = {authenticated: true, user: req.body.nickname};
        
        // set browserSession 
        browserSession = req.session;
        browserSession.nickname = req.body.nickname;
    } else {
        result = {authenticated: false};
    }
    res.json(result);
});


// create Express server
const server = http.createServer(app);

// create a predefined WebSocket server
const wss = new WebSocketServer({noServer: true});

// listen to upgrade event
server.on('upgrade', (req, socket, head) => {

    // some authentication...
    if (browserSession === undefined) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n');
        socket.destroy();
        return;    
    }

    // startup websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});

server.listen(port, (req, res) => {
    console.log(`Express server running on port ${port}`);
});


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