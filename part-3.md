[Back](README.md)

## 3 Chat application
Time to create a chat application with a few features. But first, let's make some changes on our client side: the use of EcmaScript modules. 
Keep in mind - importing functions and classes have some advantages - and some disadvantages. One drawback - the console.log() method is not recognized by the client because importing a module makes just functionality in that very same module.

Our client html files script element:

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

Create a new folder named **js** in folder **public**. Since the function parse (at tis moment) is the same function as the one in server side folder libs/functions ```.js```... 
...an easy way is to copy this file and paste into client side public/js. Remove the function parse declaration from the script element.

```
| ─ libs
|   └─ functions.js
| ─ server.js
| ─ public
|   └─ js
|      └─ functions.js
|   └─ index.html
```

ECMSScript modules must use the attribute type="module". Link module, and import functionality coded with export statement.
Be sure to use type attribute for scripts importing functionality.

```html
    <script type="module">
        import { parse } from './js/functions.js';
        
        // use WebSocket
        const websocket = new WebSocket("ws://localhost:8081");

        // ...

    </script>
```
    
If you try to use browser console to communicate with server you will notice that the variable "websocket" no longer is known.


***

A few steps to create the application:

- Let the user enter a nickname
- Display a field for sending a new message
- Show the conversation

***

### Let the user enter a nickname
Use some static elements on the page showing an application title, input field for name and a button to set name. 

We will also have a hidden input field for new text messages. 

```html
    <h1>Time to chat!</h1>

    <input type="text" id="inputNickname" maxlength="8" placeholder="Your name (3-8 characters)">
    <button id="buttonNickname">Enter chat</button>
    <hr>
    <input type="text" id="inputText" placeholder="Type and press Enter" class="hidden">

```

We need some CSS to style the code above. Create a folder named styles, add a css file named  *style.css*.

```
| ─ libs
|   └─ functions.js
| ─ server.js
| ─ public
|   └─ js
|      └─ functions.js
|   └─ styles
|      └─ style.css
|   └─ index.html
```
 


Link style in head element:
```html
    <link rel="stylesheet" href="styles/style.css">
```


Setting som colors, and a class named hidden (to dynamically change visibility on elements using JavaScript).


```css
html {
    font-family: monospace;
    background-color: #222;
    color: #ddd
}

input, button {
    padding: 0.3rem
}

.hidden {
    display: none;
}
```


A click on the button will make the input field disabled, and the button hidden from DOM. Obviously, this input field should be validated (using the attribute *pattern* or some other client side validation).

Listen to click button and set the user nickname. Set a cursor in fields using method focus()

```javascript

    let nickname;

    const inputNickname = document.getElementById("inputNickname");
    const buttonNickname = document.getElementById("buttonNickname");
    const inputText = document.getElementById("inputText"); 
    
    inputNickname.focus();

    buttonNickname.addEventListener("click", () => {
        nickname = inputNickname.value;
        if (nickname.length > 2) {

            // disable element
            inputNickname.setAttribute("disabled", "disabled");
            
            // hide button
            buttonNickname.classList.toggle("hidden");

            // display field for new text messages
            inputText.classList.toggle("hidden");
            inputText.focus();
        }
    });
```

Add an event listener to the input element: listen to **keydown**. Using Enter key triggers the message to been displayed or sent away.

```javascript

        // listen to keydown event, send message
        inputText.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && inputText.value.length > 0) {
                let obj = {type: "chat", data: inputText.value}
                websocket.send(JSON.stringify(obj));
            }
        });
```

You should a response from server. You can improve this client side interface - when a chat message has been sent, reset value.
Use String trim to remove blanks...


### Chat conversation 


Time to display messages in a DOM element. In this chat application every chat message will contain three tings:
- user
- message
- time
  
To display this we can use different kind of elements. Trying to avoid a bunch of divs with class names...
...so let ud display a list of messages in this way:

```html
    <ul id="conversation">
        <li>
            <span></span>
            <p></p>
            <time datetime=""></time>
        </li>
    </ul>
``` 

- element **span** contains the user
- element **p** contains the message
- element **time** contains the time message was sent in a machine-readable format

The conversation thread will be something like:

```html
    <ul id="conversation">
        <li>
            <span>Pippin</span>
            <p>Great!</p>
            <time datetime="2021-09-27T08:32.000Z">08:32</time>
        </li>
        <li>
            <span>Merry</span>
            <p>What about second breakfast?</p>
            <time datetime="2021-09-27T08:31.000Z">08:31</time>
        </li>
    </ul>
```

#### Some styling

Edit *style.css*. Use selectors and add some initial css properties (reset some default element values, set some new). Use a grid layout: 

```css
    ul {
        list-style-type: none;
        padding: 0 1rem;
    }
    li {
        display: grid;
        grid-template-columns: 1fr 5fr 1fr;
        gap: 1rem;
        margin: 0.5rem 0;
    }
    li * {
        margin: 0;
    }
    li time {
        text-align: right;
    }
```


### Dynamically adding elements to DOM
There are a couple of ways to add new elements to DOM. We can create elements like this:

***

```javascript
    let li = document.createElement("li");
    let span = document.createElement("span");
    span.textContent = "Pippin";
    let p = document.createElement("p");
    p.textContent = "What about second breakfast?";
    let time = document.createElement("time");
    time.setAttribute("datetime", "2021-09-25T08:31.000Z");
    time.textContent = "08:31:00";
    li.appendChild(span);
    li.appendChild(p);
    li.appendChild(time);
    document.getElementById("conversation").appendChild(li);
```

***

Another way is to use the **html element *template***. And that's the way in this tutorial.

In index.html add a *ul element* with id *conversation*, and a template as show:

```html
    <!-- an empty unordered list-->
    <ul id="conversation"></ul>

    <!-- a template for new list elements -->
    <template id="message">
        <li>
            <span></span>
            <p></p>
            <time datetime=""></time>
        </li>
    </template>
```

A template element is not rendered in DOM. Using JavaScript, we get a reference to the template. Clone the content and use this *document fragment*.

```javascript

    // clone template (document fragment)
    let tpl = document.querySelector("template#message").cloneNode(true); 

    // now text content can be set and added to DOM
    tpl = tpl.content;
    tpl.querySelector("span").textContent = "Pippin";
    tpl.querySelector("p").textContent = "What about second breakfast?";
    tpl.querySelector("time").setAttribute("datetime", "2021-09-25T08:31.000Z");
    tpl.querySelector("time").textContent = "08:31:00";
    document.body.querySelector("#conversation").append(tpl);
```


The code should run every time someone sends a message. Create a function and use variables *user, message and datetime*.
Place the function in functions.js. 

```javascript
export function addMessage(user, message, date) {

    // todo variables...

    // clone template (document fragment)
    let tpl = document.querySelector("template#message").cloneNode(true);

    // add to DOM
    tpl = tpl.content;
    tpl.querySelector("span").textContent = user;
    tpl.querySelector("p").textContent = message;
    tpl.querySelector("time").setAttribute("datetime", new Date(date));
    tpl.querySelector("time").textContent = formatDate(date);
    return document.body.querySelector("#conversation").append(tpl);
}
```

The element *time* has a datetime attribute. Here we can pass in a valide datetime format like
```javascript
new Date(date).toISOString()  
```

The element *time* value should be easier to read for someone using the chat, like HH:mm:ss. This can be done using a function like:

```javascript
export function formatDate(date) {

    if (date instanceof Date !== true) { 
        return; 
    }
    let hours = date.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    
    let minutes = date.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;
    
    let seconds = date.getSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" +  minutes + ":" + seconds;
}
```
Save the function **formatDate()** in functions.js.

Import the two new functions inside your script element:

```javascript
         
        import { parse, addMessage, formatDate } from './js/functions.js';

```

Try the code on your page. When you press the Enter key display it, and send it using websocket. Since wen now have more information to send - not just the message - we send data as an object with some properties.

```javascript
        // listen to keydown event, send message
        inputText.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && inputText.value.length > 0) {

                // display local chat message () 
                let date = new Date();

                // add message to DOM
                addMessage(nickname, inputText.value, date);

                // send to websocket server  
                let obj = {type: "chat", data: {nickname: nickname, text: inputText.value, date: date}}
                websocket.send(JSON.stringify(obj));

                // reset field
                inputText.value = "";
            }
        });
```

***