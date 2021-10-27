[Back](README.md)

#### 5 Who is online
- online users
- join and leave chat
- features
- 
***

### Client side first steps

To find onut who joins a chat we need to use some method. One way is to pass the user in a url querystring. Add this to websocket url in the client side:
```javascript

        // use WebSocket
        const websocket = new WebSocket("ws://localhost:8081?nickname="+nickname);
```

The variable *nickname* must be set before, so re-arrange the code and move the websocket part after handling authentication.
Before we make changes on the server side script, add options for messages. Prepare listening to messages types *joinChat*, *leaveChat" and *online*:

```javascript
            // use property 'type' to handle message event
            switch (obj.type) {

                case 'chat':

                    // display chat message 
                    addMessage(obj.data.nickname, obj.data.text, new Date(obj.data.date));
                    break;           
                case 'joinChat':
                    break;                  
                case 'leaveChat':
                    break;
                case 'online':
                    break;
                default:
                    break;
            }

```

### Server side first steps
Store chat participants in an array *usersOnline*. Initiate the variable:

```javascript
let usersOnline = [];
```

When a user has been authenticated, get the nickname from the request url. Make sure you add this argument (req):

```javascript

// listen to WebSocket Server (wss) connections
wss.on('connection', (ws, req) => {

```

When a user join, broadcast this to all clients. We need a way to parse a url querystring and get a keys value. Create a function in *libs/functions.js*:

```javascript
export function getValueFromKey(url, key) {

    let parts = url.split('?');
    if (parts.length === 0) {
        return;
    }
    
    let pairs = parts[1].split('&');
    for (let i = 0; i < pairs.length; i++) {
        let parts = pairs[i].split('=');
        if (parts[0] === key) {
            
            return parts[1];
            break;
        } 
    }

    return;
}
```

Since we need a way to keep a list of online users, add a function to remove a user from an array:

```javascript
export function removeFromArray(item, array) {
    let tmp = [];
    array.forEach(element => {
        if (item !== element) {
            tmp.push(element);
        }
    });

    return tmp;
}
```

***

The code to add a nickname to online list:


```javascript

let usersOnline = [];

// listen to WebSocket Server (wss) connections
wss.on('connection', (ws, req) => {
    console.log('Client connected from IP: ', ws._socket.remoteAddress);
    console.log('Number of connected clients: ', wss.clients.size);

    // get nickname from querystring, broadcast
    let nickname = getValueFromKey(req.url, "nickname");
    if (nickname !== "undefined") {
        let obj = {type: "joinChat", nickname: nickname};
        usersOnline.push(nickname);
        wss.broadcast(JSON.stringify(obj), ws);    
    }

```

In the close event broadcast when a user leaves, and remove the user from users online.

```javascript

    // close event
    ws.on('close', () => {
        console.log('Client disconnected\n');

        usersOnline = removeFromArray(nickname, usersOnline);

        let obj = {
            type: "leaveChat",
            data: nickname
        }
        wss.broadcast(JSON.stringify(obj));
    });

```



To display a list of online users, add a ul element do DOM just before chat conversation.

```html
    <ul id="online"></ul>

    <ul id="conversation">
    </ul>
```

And add a client side function to *public/js/functions.js* to update the list. Make sure you import this function.

```javascript
 export function displayOnline(list) {

    let ul = document.querySelector("ul#online");

    ul.innerHTML = "";
    list.forEach(element => {
        let li = document.createElement("li");
        li.textContent = element;
        ul.appendChild(li);
    });
}
```

To get data from server who's online, use setInterval on the client sidde to request data.

```javascript
        websocket.addEventListener('open', () => {

            setInterval(() => {
                let obj = {type: "online"};
                websocket.send(JSON.stringify(obj));
            }, 10000);
        })
```

Back to server side script. Time to route incoming websocket message. Broadcast joinChat and leaveChat messages. Incoming message from client with the type *online* should just be sent to that client, no broadcast.

#### Server side
```javascript
        // use property 'type' to handle message event
        switch (obj.type) {
           
            case "chat":
                wss.broadcastButExclude(JSON.stringify(obj), ws);
                break;
            case "leaveChat":
                    obj = {type: "leaveChat", nickname: nickname};
                    wss.broadcastButExclude(JSON.stringify(obj), ws);
                    break;
            case "joinChat":
                    obj = {type: "joinChat", nickname: nickname};
                    wss.broadcastButExclude(JSON.stringify(obj), ws);
                    break;
            case "online":
                    obj = {type: "online", nicknames: usersOnline};
                    ws.send(JSON.stringify(obj));
                    break;
            default:
                    console.log("Message type is:", obj.type)
                break;
        }

```

#### Client side
```javascript
        // get data property from MessageEvent using object destructing
        websocket.addEventListener("message", ({data}) => {

            let obj = parse(data);

            // use property 'type' to handle message event
            switch (obj.type) {

                case 'chat':
                    // display chat message 
                    addMessage(obj.data.nickname, obj.data.text, new Date(obj.data.date));
                    break;
                case 'online':
                    displayOnline(obj.nicknames)
                    break;
                case 'joinChat':
                    console.log(obj);
                    break;
                case 'leaveChat':
                    console.log(obj);
                    break;

                default:
                    break;
            }
        });

```

***

#### Is typing

A feature in a chat application is to show if a user is typing. This feature keeps a history every time a user press a key.
Create an array in *index.html*

```javascript

        // an array keeping keys pressed
        let lastKeys = [];

```

In the event listener for keydown, we push a current time to the array lastKeys.  

```javascript

        // listen to keydown event, send message
        inputText.addEventListener("keydown", (event) => {

            // display local chat message () 
            let date = new Date();

            // update time when key pressed
            lastKeys.push((date.getTime()));
            
            if (event.code === "Enter" && inputText.value.length > 0) {

                // ...
```

To handle a person joining the chat app, we must check if he/her is actually typing - or just idle. A setInterval function will do the job. This in one approach - use 2 different setInterval functions: The first function handles an online user list, and the second checks if a user is typing - or doing something else.  

```javascript

        websocket.addEventListener('open', () => {

            let obj = {type: "online"};
            websocket.send(JSON.stringify(obj));

            setInterval(() => {
                let obj = {type: "online"};
                websocket.send(JSON.stringify(obj));
            }, 10000);

            setInterval(() => {

                let obj = {type: "isTyping", status: false};
                if (lastKeys.length > 2) {

                    // is typing
                    let diff = lastKeys[lastKeys.length-1] - lastKeys[lastKeys.length-3];               
                    if (diff < 2000) {
                        obj.status = true;
                        lastKeys.pop();
                    }

                    // reset if idle
                    let time = new Date();
                    if (time.getTime() - lastKeys[lastKeys.length-1] > 1000) {
                        obj.status = false;
                    }
                }
                websocket.send(JSON.stringify(obj));
            }, 2000);
        })

```
The client sends the message to server. The listening part on the server handles the incoming *isTyping* message, and broadcast chat clients:
*server.js*

```javascript

            case "isTyping":
                if (obj.status) {
                    console.log(`${nickname} is typing....`);
                    obj = {type: "isTyping", nickname: nickname};
                    wss.broadcastButExclude(JSON.stringify(obj), ws);
                }
            break;
```

And, that takes us back to client. An incoming message who is typing. In this case showing his/her name in a color:

```javascript
                case 'isTyping':
                    let lis = document.querySelector("#online").childNodes;
                    lis.forEach(li => {
                        if (li.innerText === obj.nickname) {
                            li.style.color = "yellow";
                        }
                    })
                    break;
                default:
```

That's all folks...or at least...some parts in a chat application :)