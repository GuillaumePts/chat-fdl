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
        socket.emit('newMessage', textInput);
        
    } else {
        return false;
    }

})


socket.on('namespace', (data) =>{
    document.querySelector('#name').textContent =data
})

function _join(nom){
    console.log(nom, pseudo);
    // document.querySelector('#name').textContent = nom 
    socket.emit('select', nom)
}