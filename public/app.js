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

    // const imgInput = document.querySelector('#imgInput');
     
    

    if (textInput.length > 0) {

        socket.emit('message', textInput);
        createElementFunction('moi', textInput)
     
    } else {
        return false;
    }

    // if (imgInput ) {

    //     socket.emit('image', imgInput);
    //     createImage(imgInput.files[0])
    //     console.log(imgInput.files[0].name);
    // } else {
    //     return false;
    // }

    
        
      
})


function createImage(path){
let img = document.createElement('img')
img.src = path;
document.querySelector('#msgcontent').appendChild(img)
}

socket.on('namespace', (data) => {

    document.querySelector('#name').textContent = data

})

socket.on('messageView', (data) => {

    createElementFunction('autre', data)
})

socket.on('oldMessagesMe', (messageSender, messageContent) => {
    createElementFunction('oldMessagesMe', messageSender, messageContent)

})

socket.on('oldMessages', (messageSender, messageContent) => {
    createElementFunction('oldMessages', messageSender, messageContent)

})




function createElementFunction(element, content, content2) {
    let newElement = document.createElement('div');
    let messagemoi = document.createElement('p');

    switch (element) {
        case 'moi':
            newElement.classList.add(element, 'message');
            document.querySelector('#msgcontent').appendChild(newElement);
            messagemoi.classList.add('messagemoi');
            messagemoi.textContent = pseudo + ' : ' + content;
            newElement.appendChild(messagemoi)

            break;

        case 'autre':
            newElement.classList.add(element, 'message');

            document.querySelector('#msgcontent').appendChild(newElement);

            messagemoi.classList.add('messageautre');
            messagemoi.textContent = content.pseudo + ' : ' + content.message;
            newElement.appendChild(messagemoi)
            break;


        case 'oldMessages':
            newElement.classList.add('autre', 'message');

            document.getElementById('msgcontent').appendChild(newElement);
            messagemoi.classList.add('messageautre');
            messagemoi.textContent = content + ' : ' + content2;
            newElement.appendChild(messagemoi)

            break;

        case 'oldMessagesMe':
            newElement.classList.add('moi', 'message');

            document.getElementById('msgcontent').appendChild(newElement);
            messagemoi.classList.add('messagemoi');
            messagemoi.textContent = content + ' : ' + content2;
            newElement.appendChild(messagemoi)
            break;


    }



}

function _join(nom) {

    // document.querySelector('#name').textContent = nom 
    document.querySelector('#msgcontent').innerHTML = '';

    socket.emit('select', nom)
}


// onkeypress="writting()" onblur="notWritting()"