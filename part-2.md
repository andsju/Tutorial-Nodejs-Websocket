[Back](README.md)

## Send and receive messages

### Server side

To handle incomming data we need to listen for the *message* event in our WebSocket.
In a laborative tutorial we use console.log() frequently. Use console.dir() if you need to display all properties for an object.

Edit server.js and add listen to the message event.

```javascript
    // WebSocket events (ws) for a single client
    // --------------------

    // close event
    ws.on('close', () => {
        console.log('Client disconnected\n');
    });

    // message event
    ws.on('message', (data) => {
        console.log('Message received: ', data);
    });
```

Try to send data to server. Use web browsers developer console for laboration purpose.

```websocket.send("Hello backend!")```
```websocket.send([1,2,3,4,5])```
```websocket.send({ name: "Flisa", data: { x: 100, y: 200 }})```
```websocket.send(new Uint32Array([1,2,3]))```

Backend server terminal should display incoming data. 


***

### Validate data


Time to *handle incoming data to avoid errors*

You should use a way to receive data to avoid errors. Since we need more information than just a string, we use JSON format. 
A good way to send and receive data between a server and a client.


A client side JSON example:
```javascript
let obj = { shape: "circle", x: 100, y: 50 };
websocket.send(JSON.stringify(obj))
```


Receive and handle using JSON.parse():
```javascript
    // message event
    ws.on('message', (data) => {
        let obj = JSON.parse(data);
        console.log('Message received: ', obj);
    });
```

Now, try to send something like...

```ws.send("tada")```

...will raise an exception if data is anything but JSON.

We will use a try-catch block to avoid an error.

Create a server side function for parsing data. This function could be one of many functions in our application. A good thing is to have these functions in a re-usable way. 
A folder named "libs" is a common name for classes, functions and modules. 

```
| ─ libs
|   └─ functions.js
| ─ server.js
| ─ public
|   └─ index.html
```

Create a file named functions and export a function named parse.

*functions.js*

```javascript
export function parse(data) {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log('Error parsing expected json data: ',  error);
        return;       
    }
}
```

In order to use this function in our *server.js* we can import the function we created.

Edit server.js 

Import function parse from the file functions.js

```javascript
import { parse } from './libs/functions.js';
```

Now we can use this function by it's name. Since the function now should return a javasript object, use a proper variable name.

server side
```javascript
    // message event
    ws.on("message", (data) => {
        let obj = parse(data);
        console.log('Message received: ', obj);
    });
```

>Receiving data in this way you must keep in mind to **send** JSON stringified javascript objects.

```javascript
let obj = {shape: "circle", x: 100, y: 50};
websocket.send(JSON.stringify(obj));
```


***

### Communicate from server to client

Time so send data from server to client. Prepare incoming message to client. 

#### Client side 

Add an event listener and listen to *message* event. 

```html
    <script>
        
        // use WebSocket
        const websocket = new WebSocket('ws://localhost:8081');

        // listen on close event
        websocket.addEventListener('close', (event) => {
            console.log('Server down...', event);
        });

        websocket.addEventListener('message', (event) => {
            console.log(event);
        });

    </script>
```

#### Server side 

Reply to a single client

```javascript
    // message event
    ws.on("message", (data) => {
        let obj = parse(data);
        console.log('Message: ', obj);

        ws.send('Hi client, I got a message from you');
    });
```

Use web developer console and send some date to server. You should see a reply from server in that same client console. In your browser vlient console you will recevie a **MessageEvent**, something like:

```javascript
MessageEvent {isTrusted: true, data: 'Hi client, I got a message from you', origin: 'ws://localhost:8081', lastEventId: '', source: null}'

```
The property **data** contains information sent from websocket server. We can use *object destructuring* to just get data property from object. Compare these two patterns:

```javascript
    // use WebSocket
    const websocket = new WebSocket("ws://localhost:8081");
    websocket.addEventListener("message", (event) => {
        console.log(event);
    });

    // get data property from MessageEvent using object destructing
    websocket.addEventListener("message", ({data}) => {
        console.log(data);
    });
```

Since we're using JSON format in our websocket - go back to server and change the way we send data:

```javascript
   // message event
    ws.on("message", (data) => {
        let obj = parse(data);
        console.log(obj);

        // process incoming data, send new data...

        let objReply = {
            type: "message",
            data: "Hi client, I got a message from you"
        }
        ws.send(JSON.stringify(objReply));
    });
 ```



### Server side

A stringified object is sent from the client and parsed back to an object on the server. The console.log() method outputs the message in web console. Then we can format the output using a *Format specifier*. Here are som options:

```
%s → string
%o → DOM element
%O → object
```

Let's reply to incoming message;

```javascript
    // message event
    ws.on('message', (data) => {
        let obj = parse(data);
        console.log('Message received: %O', obj);

        // process incoming data, send new data...
        let objReply = {
            type: "message", 
            data: "Hi client, I got a message from you: " + obj.data.toUpperCase();
        }
        ws.send(JSON.stringify(objReply));
    });
```


***
We will use the same function to parse a message on the client. For now, we just copy and paste it in our script element. 
***

```html
    <script>

        // use WebSocket
        const websocket = new WebSocket("ws://localhost:8081");

        // get data property from MessageEvent using object destructing
        websocket.addEventListener('message', ({data}) => {
            console.log(data);
            console.log(parse(data));
        });

        // functions
        function parse(data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.log('Error parsing expected json data: ', error);
                return;
            }
        }
    </script>
```


In this way - using a **type** property - we can send and receive different type of messages containing data. Something like:

```javascript
let objReply;

// chat
objReply = {type: "chat", data: "Hello - coding is fun" };

// chat extended
objReply = {type: "chat", data: {message: "Hello - coding is fun", date: new Date()} };

// move a player in a game
objReply = {type: "playerPosition", data: {x: 300, y: 50, dx: 400, dy: 100} };
```

Figure out different types of messages, and use a switch statement and decide how an application should handle incoming and outgoing messages. 

***

### Broadcast

Send a message to all clients is possible. Iterate connected clients.

```javascript
wss.clients.forEach(function each(client) {
    client.send("Hello");
});
```

Create a reusable brodcast function, and make sure connections are open:
```javascript
wss.broadcast = function(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}
```


Client side
```javascript
// message event
ws.on("message", (data) => {
    let obj = parse(data);
    console.log(obj);

    let objReply;

    objReply = {type: "message", data: "Hi client, I got a message from you" }
    ws.send(JSON.stringify(objReply));

    objReply = {type: "broadcastMessage", data: "Backend server says important things to all clients..." }
    wss.broadcast(JSON.stringify(objReply));
});
```

Send data to all clients, but not from current client itself. Add an argument to exclude client

```javascript
wss.broadcastButExclude = function(data, someClient) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (client !== someClient) {
                client.send(data);
            }
        }
    });
}
```

Broadcast to all but itself, pass WebSocket client:

```javascript

wss.broadcastButExclude(JSON.stringify(objReply), ws);
```

```javascript
    // close event
    ws.on('close', () => {
        console.log('Client disconnected\n');
        let objReply = {type: "message", data: "Another client disconnected"}
        wss.broadcastButExclude(JSON.stringify(objReply), ws);
    });
```


Change second parameter to handle an array of clients ... websocket communication in channels might be an option...

***