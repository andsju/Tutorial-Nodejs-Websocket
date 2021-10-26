[Back](README.md)


## 1 Basic Websocket

***

Open terminal and install ws library:
```npm i ws```

### Server side

The WebSocket server *(wss)* has a *connection event*. It handles all client connections.


Edit server.js and setup a WebSocket server.

*server.js*

```javascript
import { WebSocketServer } from 'ws';

// create WebSocket server
const wss = new WebSocketServer({ port: 8081 });

// listen to WebSocket server (wss) connections
wss.on('connection', (ws) => {
    console.log('New client connection');
});
```

A client IP number has some properties, like:

```ws._socket.remoteAddress```
```ws._socket.family```

Add this to your server side console.log():

```javascript
console.log('New client connection from IP: ', ws._socket.remoteAddress);
```

### Client side


Edit index.html and setup a basic HTML document. Add a script element and create a WebSocket client. Make sure you **match client side port and server side port**. 

*index.html*

```html
<script>
    // use WebSocket
    const websocket = new WebSocket("ws://localhost:8081");
</script>
```

***

Start server using terminal cmd:
```node server.js```

Open index.html in a browser using file path (can be done using Visual Code extension "open in browser"), browser web developer console should display:

```A new client connection from IP ::1```


In the bowsers web developer tools, check "Network" "WS" and  "Headers" for your current local connection.
You should see a server and client initial communcation - a websocket handshake.

```
Request URL: ws://localhost:8081/
Request Method: GET
Status Code: 101 Switching Protocols
```
Examine **Request Headers** and **Response Headers** and you vill find connection *Upgrade* for websocket connections.

***

WebSocket events: open, close, message, error

Time to edit backend server - *server.js*.

Each client *(ws)* has they're own events. Listen to these events when WebSocket server has an open connection.
One event is "close". It vill fire off when a client connects, or loses connection to server.


```javascript
// listen to WebSocket Server (wss) connections
wss.on('connection', (ws) => {
    console.log('Client connected from IP: ', ws._socket.remoteAddress);
    
    // WebSocket events (ws) for a single client
    // --------------------

    // close event
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
```


A client can also listen to a close event *if the server goes down*. Add an event listener for close event:


*index.html*

```html
<script>

    // use WebSocket
    const websocket = new WebSocket("ws://localhost:8081");

    // listen on close event
    websocket.addEventListener('close', (event) => {
        console.log('Server down...', event);
    });

</script>
```





***

#### Time to laborate

Start server and reload browser:
```A new client connection from IP ::1```

Reload browser - once again:
```
Client disconnected
A new client connection from IP ::1
```

Every time you choose to reload browser, the connection is lost, and then it connects again.

Add a row and log number of connected clients. This property belongs to the WebSocket server instance. 
```wss.clients.size```

```javascript
console.log('Number of connected clients: ', wss.clients.size);
```

Here is the code in server.js:

*server.js*

```javascript
// listen to WebSocket Server (wss) connections
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
```

***

Run server and connect some browser tabs / agents.

Next step is to send and validate messages between client and server.

[Back to README.md](README.md)