# Tutorial-Nodejs-WebSocket-Lab
@andsju

A tutorial in how to setup a websocket application in a Nodejs environment. Laborative approach, step-by step, the use of ES6 modules (ECMAScript 2015) server and client side. 
The file extension for javascript modules can be both ```.js``` and ```.mjs```. For clarity, the ```.mjs``` extension is a good choise. However, since mjs extension lack some intellisense using module imports, the ```.js``` extension is used.

We will use WebSocket library **ws** 
[https://github.com/websockets/ws](https://github.com/websockets/ws)

***

#### Get started - setup a Node.js project
Create a new folder, start up terminal and run cmd:
```npm init```

Entry point for firing up the server will be *server.js* instead of the default *index.js*.


Start server cmd:
```node server.js```  

Terminate server cmd:
```Ctrl+c```

***

Create a empty server file:

```server.js```

Create a empty index.html in a folder named public.

```index.html```

```
| ─ server.js
| ─ public
|   └─ index.html
```

...and you're ready for this tutorial.

***

#### 1 Basic Websocket
- Setup a basic WebSocket server using node.js **ws** library.
- Setup a client html page
- Listen to WebSocket events: connection, open, close

[Go to part 1: Basic Websocket](part-1.md)

Branch *basic*
***

#### 2 Send, receive and validate messages
- Listen to WebSocket event: message, error
- Server side
- Client side

[Go to part 2: Send, receive and validate messages](part-2.md)

Branch *messages*
***

#### 3 Chat application
- ES6 client side modules 
- Setup a JavaScript chat application in DOM (template | document fragment)
- Add some features ...

[Go to part 3: Chat application](part-3.md)

Branch *chat*
***

#### 4 Add Express to chat application
- authentication before using websockets
- sessions
- routes
- cookies

[Go to part 4: Add Express to chat application](part-4.md)

Branch *express*
***

#### 5 Who is online
- online users
- join and leave chat
- feature: is typing

[Go to part 5: Who is online](part-5.md)

Branch *features*

***
***