export function parse(data) {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log('Error parsing expected json data: ', error);
        return;
    }
}

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

export function removeFromArray(item, array) {
    let tmp = [];
    array.forEach(element => {
        if (item !== element) {
            tmp.push(element);
        }
    });

    return tmp;
}