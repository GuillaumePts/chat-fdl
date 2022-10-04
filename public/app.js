


let socket = io.connect('http://localhost:9999');

let pseudo = ''
if (pseudo === '') {

    pseudo = prompt('ton nom fdp ?');

}

let tabDesConnect = [];
let header= document.querySelector('#header')

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




socket.on('namespace', (data) => {

    header.innerHTML=''

   let namespace = document.createElement('p')
   namespace.textContent= data
   header.appendChild(namespace)

   let connect = document.createElement('div')
   connect.id = data
   header.appendChild(connect)
   


})





socket.on('messageView', (data) => {

    createElementFunction('autre', data)
})

socket.on('oldMessagesMe', (messageSender, messageContent) => {

    if (messageContent.length > 8000) {

        createElementFunction('oldimgme', messageContent)

    } else {

        createElementFunction('oldMessagesMe', messageSender, messageContent)

    }


})

socket.on('oldMessages', (messageSender, messageContent) => {

    if (messageContent.length > 8000) {

        createElementFunction('oldimgautre', messageContent)

    }else{

        createElementFunction('oldMessages', messageSender, messageContent)

    }
    

})

socket.on('imageview', (src) => {


    createElementFunction('imageautre', src)

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

        case 'imageautre':
            newElement.classList.add('autre', 'message');
            document.getElementById('msgcontent').appendChild(newElement);

            let imgview = document.createElement('img')
            imgview.classList.add('img')
            imgview.src = content

            newElement.appendChild(imgview)

            break;

        case 'oldimgautre':
            newElement.classList.add('autre', 'message');
            document.getElementById('msgcontent').appendChild(newElement);

            let oldimgautre = document.createElement('img')
            oldimgautre.classList.add('img')
            oldimgautre.src = content

            newElement.appendChild(oldimgautre)

            break;

        case 'oldimgme':
            newElement.classList.add('moi', 'message');
            document.getElementById('msgcontent').appendChild(newElement);

            let oldimgme = document.createElement('img')
            oldimgme.classList.add('img')
            oldimgme.src = content

            newElement.appendChild(oldimgme)

            break;


    }



}

function _join(nom) {

   
    document.querySelector('#msgcontent').innerHTML = '';

    socket.emit('select', nom)
}

function handleFiles(files) {

    let imageType = /^image\//;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (!imageType.test(file.type)) {
            alert("on prend que les images");
        } else {

            let img = document.createElement("img");
            let newElement = document.createElement('div');
            newElement.classList.add('moi', 'message');
            document.getElementById('msgcontent').appendChild(newElement);
            img.classList.add('img')
            newElement.appendChild(img)




            img.file = file;

            let reader = new FileReader();

            reader.onload = (function (aImg) {

                return function (e) {
                    let src = e.target.result;
                    socket.emit('testimg', src)
                    aImg.src = e.target.result;

                };
            })(img);

            reader.readAsDataURL(file);



        }

    }
}