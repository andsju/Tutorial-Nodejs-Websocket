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

Entry point for firing up the server will be *server.mjs* instead of the default *index.js*.


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