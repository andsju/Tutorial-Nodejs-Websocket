export function parse(data) {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log('Error parsing expected json data: ', error);
        return;
    }
}

export function addMessage(user, message, date) {

    // clone template (document fragment)
    let tpl = document.querySelector("template#message").cloneNode(true);

    // add to DOM
    tpl = tpl.content;
    tpl.querySelector("span").textContent = user;
    tpl.querySelector("p").textContent = message;
    tpl.querySelector("time").setAttribute("datetime", new Date(date).toISOString());
    tpl.querySelector("time").textContent = formatDate(date);
    return document.body.querySelector("#conversation").append(tpl);
}

export function formatDate(date) {

    if (date instanceof Date !== true) { 
        return ""; 
    }
    let hours = date.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    
    let minutes = date.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;
    
    let seconds = date.getSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" +  minutes + ":" + seconds;
}

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

export function displayOnline(list) {

    let ul = document.querySelector("ul#online");

    ul.innerHTML = "";
    list.forEach(element => {
        let li = document.createElement("li");
        li
        li.textContent = element;
        ul.appendChild(li);
    });
}