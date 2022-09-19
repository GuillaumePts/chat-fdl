let socket = io.connect('http://localhost:9999');

let pseudo = ''
if (pseudo === '') {

    pseudo = prompt('ton nom fdp ?');

}

console.log(pseudo);

socket.emit('pseudo', pseudo);
document.title = pseudo
