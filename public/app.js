let socket = io.connect('http://localhost:9999');

let pseudo = ''
if (pseudo === '') {

    pseudo = prompt('ton nom fdp ?');

}

console.log(pseudo);

socket.emit('pseudo', pseudo);
document.title = pseudo


function _join(nom){
    console.log(nom, pseudo);
    document.querySelector('#name').textContent = nom
    socket.emit('test', nom)
}