[Back](README.md)

## 4 Add Express to chat application
- authentication before using websockets
- sessions
- routes
- cookies

### Authentication before using application
Time to auhtenticate users before a websocket connection opens. Authentication can be done using different methods. In this tutorial we choose a request-response from a web server. 


Install Express using cmd:
```javascript
npm install express
```

Express can serve static files from folders. We have already created a folder named "public".  
Here is a basic Express server serving static files from a folder named "public:

```javascript
import express from 'express';

const app = express();
const port = 5000;

app.use(express.static('public'));

app.listen(port, (req, res) => {
    console.log(`Express server running on port ${port}`);
});
```

In this way Express returns a http server instance. The app uses method *listen*. 

***

In a server application it's often better to create a server instance from Node.js core modules *http* or *https*. You create a server and pass Express as an argument. Then we can handle things like authentication, secure connections and share websocket connections.
A server from *http* module, pass Express app:

```javascript
// create Express server
const server = http.createServer(app);
```

Previous in this tutorial, we created a websocket server in this way:

```javascript
// create WebSocket server
const wss = new WebSocketServer({ port: 8081 });
```

This time, we create a predefined websocket server. In that way we can start to listen on a request to authenticate user before a websocket is been established. 

```javascript
// create predefined WebSocket server
const wss = new WebSocketServer({noServer: true});
```

The code to upgrade a predefined websocket server can be handled in the *upgrade* event:

```javascript
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = 8081;

app.use(express.static('public'));

// create Express server
const server = http.createServer(app);

// create a predefined WebSocket server
const wss = new WebSocketServer({noServer: true});

// upgrade event
server.on('upgrade', (req, socket, head) => {
    console.log('Upgrade event headers:', req.headers);

    // some authentication...

    // startup websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});

wss.on('connection', () => {
    console.log(`New client connection`);
});

server.listen(port, (req, res) => {
    console.log(`Express server running on port ${port}`);
});
```

If you want a user to authenticate before using websockets, send a HTTP 401 response like

```html
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic"

```

Then end the socket and use a return statement:

```javascript

        // some authentication

        socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n');
        socket.destroy();
        
        return;  

```

### Authentication
When a user types a wanted nickname we now just lock in a name if it has at least 3 characters. This will now change in order to make a simple authentication. A Hobbit name will do for this example. Let a nickname be Pippin, Merry or Sam.
The authentication process will be validatet on the server. A simple array of the nicknames, and a validation (case sensitive...):

```javascript
    ["Pippin", "Merry", "Sam"].includes(nickname);
```

We use a session in the authentication process. Prepare the use of sessions.

Install express-session using cmd:

```javascript
npm install express-session
```

Add the library to our server, and set required properties secret, resave and saveUninitialized. In a development phase we can use a global variable to store session.

```javascript
import session from 'express-session';

app.use(session({
    secret: "foryoureyesonly%tXl!p",
    resave: false,
    saveUninitialized: true
}));

// session using a variable - just for development
let browserSession;
```

Add a route to handle authentication - in this tutorial we expect an ajax call, so the response will be in json format. 

```javascript
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
```

In the upgrade event - destroy the socket if a user has'nt been validated:

```javascript

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
```


### Some client side coding
Time to change how we can set a username. We will send the nickname to the server and see if the name will do - a Hobbit name.
This could be sent using a form submit automatically showing a new page, or the same page again. But, we will send this using JavaScript fetch.

Add a async function using fetch to libs/functions.js:

```javascript
export async function postData(url, data) {

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();
}
```
At this point the eventlistener for setting a nickname:

```javascript

        buttonNickname.addEventListener("click", () => {
            nickname = inputNickname.value;
            if (nickname.length > 2) {

                // disable element
                inputNickname.setAttribute("disabled", "disabled");
                
                // hide button
                buttonNickname.classList.toggle("hidden");

                // display field for new text messages - focus element to set a cursor
                inputText.classList.toggle("hidden");
                inputText.focus();
            }
        });

```

A click on the button sends an ajax call, and the response can be handled:

```javascript

            if (nickname.length > 2) {

                // ajax call
                postData('/authenticate', {nickname: nickname})
                .then(data => {

                });

```
The server sends a json to client with the property *authenticated* - true or false. If it's true, we set a cookie for a few seconds (to keep the chosend nickname). Then the page reolads using location.reload(). It the user tries to use a nickname not allowed, we simply display a message in input:

```javascript

            postData('/authenticate', {nickname: nickname})
                .then(data => {
                    if (data.authenticated === true) {
                        
                        document.cookie = "nickname="+nickname+"; max-age="+5;
                        location.reload(false);

                    } else {
                        inputNickname.value = "Not a proper nickname..."
                    } 
                });
```

Since the page now reolads after a successfully validation we need do get this nickname from our cookie.

A cookie is stored in a browser using name=value pairs. A function to get a cookie value:

```javascript
export function getCookie(name) {
    
    // split to name=value pairs in an array
    let cookies = document.cookie.split(";");

    // loop array elements
    for (let i = 0; i < cookies.length; i++) {
        let pair = cookies[i].split("=");
        
        // check name 
        if(name === pair[0]) {
            
            return pair[1];
        }
    }
    
    return;
}
```

Add this to the list of functions we use client side:

```javascript

        // import functions
        import { parse, addMessage, formatDate, postData, getCookie } from './js/functions.js';
```

Now, when the page loads/reloads the server will be aware of sessions and the client can see if a resently cookie exists. If a cookie exists the input field will be disabled, the button to set a nickname will be hidden, and a focus to a new chat message:

```javascript
        // variables and event listeners
        let nickname; 
        
        nickname = getCookie("nickname");

        if (nickname !== undefined) {
            inputNickname.value = nickname;
            inputNickname.setAttribute("disabled", "disabled");
            buttonNickname.classList.toggle("hidden");
            inputText.classList.toggle("hidden");
            inputText.focus();
        }
```

The application should work. A user must be authenticated before connecting to a chat. 

### Some thoughts
The use of a temporary cookie can be replaced with the use of a template engine. Then server side sessions can be served to the client.

***  