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

socket.on('oldMessagesMe', (messageSender , messageContent) => {
  createElementFunction('oldMessagesMe',messageSender, messageContent)
// console.log(messageSender , messageContent)
})

socket.on('oldMessages', (messageSender , messageContent) => {
     createElementFunction('oldMessages',messageSender, messageContent)
    // console.log(messageSender , messageContent)
  })




function createElementFunction(element, content,content2) {
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
            newElement.textContent = content + ' : ' + content2;
            document.getElementById('main').appendChild(newElement);
            console.log('1 : ' + element, content, content2);
            break;

        case 'oldMessagesMe':
            newElement.classList.add('moi', 'message');
            newElement.textContent = content + ' : ' + content2;
            document.getElementById('main').appendChild(newElement);
            console.log('2 : '+element, content, content2);
            break;


    }
   


}

function _join(nom){
   
    // document.querySelector('#name').textContent = nom 
    document.querySelector('#main').innerHTML = '';
   
    socket.emit('select', nom)
}


// onkeypress="writting()" onblur="notWritting()"