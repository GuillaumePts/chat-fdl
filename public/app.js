let socket = io.connect('http://localhost:9999');

let pseudo = ''
if (pseudo === '') {

    pseudo = prompt('ton nom fdp ?');

}



console.log(pseudo);

socket.emit('pseudo', pseudo);
document.title = pseudo

document.querySelector('#chatForm').addEventListener('submit', (e) => {

    e.preventDefault();

    const textInput = document.querySelector('#msgInput').value;
    document.querySelector('#msgInput').value = '';

    
    if (textInput.length > 0) {
       
        socket.emit('message', textInput);
        createElementFunction('moi', textInput)
    } else {
        return false;
    }

})


socket.on('namespace', (data) =>{
    console.log(data);
    document.querySelector('#name').textContent =data
   
})

socket.on('messageView', (data) =>{
    console.log('test : ' + data);
    createElementFunction('autre', data)
})

socket.on('oldMessages', (messages) => {
    messages.forEach(message => {
        if (message.sender === pseudo) {
            createElementFunction('oldMessagesMe', message)
        } else {
            createElementFunction('oldMessages', message)
        }
    });
})


function createElementFunction(element, content) {
    let newElement = document.createElement('div');

    switch (element) {
        case 'moi' : 
        newElement.classList.add(element, 'message');
        newElement.textContent = pseudo + ' : ' + content;
        document.querySelector('#main').appendChild(newElement);
        break;

        case 'autre' :
            newElement.classList.add(element, 'message');
        newElement.textContent = content.pseudo + ' : ' + content.message;
        document.querySelector('#main').appendChild(newElement);
        break;

        
        case 'oldMessages':
            newElement.classList.add('autre', 'message');
            newElement.textContent = content.sender + ' : ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'oldMessagesMe':
            newElement.classList.add('moi', 'message');
            newElement.textContent = content.sender + ' : ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;


    }
   


}

function _join(nom){
   
    // document.querySelector('#name').textContent = nom 
    document.querySelector('#main').innerHTML = '';
   
    socket.emit('select', nom)
}


// onkeypress="writting()" onblur="notWritting()"