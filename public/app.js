let socket = io.connect('https://192.168.1.13:9999', {secure: true});



let pseudo = ''
if (pseudo === '') {

    pseudo = prompt('ton nom fdp ?');

}




let tabDesConnect = [];
let header = document.querySelector('#header')

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


socket.on('voiciLesUsers', (users) => {
    voiciUsers(users)
})



socket.on('namespace', (data) => {

    header.innerHTML = ''

    let interloc = document.createElement('div')
    interloc.id = 'interloc'
    header.appendChild(interloc)

    let namespace = document.createElement('p')
    namespace.id = 'name'
    namespace.textContent = data
    interloc.appendChild(namespace)

    let connect = document.createElement('div')
    connect.id = data
    interloc.appendChild(connect)



})

socket.on('co', (nom) => {
    document.querySelector('#' + nom).classList.add('connected')
})

socket.on('pasco', (nom) => {
    document.querySelector('#' + nom).classList.remove('connected')
})






socket.on('messageView', (data) => {

    createElementFunction('autre', data)

})

socket.on('oldMessagesMe', (message) => {

      
            createElementFunction('oldMessagesMe', message)
       
            // socket.emit('searchImage', message.img)
      
       

})

socket.on('oldMessages', (message) => {

      

       
            createElementFunction('oldMessages', message)
      
            
       

})

socket.on('afficheImage', (photo)=>{
    
    console.log(photo.name);
    let div = document.getElementById(photo.name)
    div.textContent=''
    let img = document.createElement('img')
    img.src = photo.src
    img.classList.add('img')
    div.appendChild(img)

   
   
})

socket.on('oldimgautre', (src)=>{
    createElementFunction('oldimgautre', src)
})

socket.on('oldimgme', (src)=>{
createElementFunction('oldimgme',src)
})

socket.on('imageview', (src) => {
    
     createElementFunction('imageautre', src)

})

socket.on('writting', (pseudo) => {
    document.querySelector('#isWritting').textContent = pseudo + ' est en train d\'écrire'
})
socket.on('notWritting', () => {
    document.querySelector('#isWritting').textContent = ''
})



function writting() {
    socket.emit('writting', pseudo)
}

function notWritting() {
    socket.emit('notWritting')
}


function createElementFunction(element, content) {
    let newElement = document.createElement('div');
    let messagemoi = document.createElement('div');
    let info = document.createElement('div')

    switch (element) {
        case 'moi':
            newElement.classList.add(element, 'message');
            document.querySelector('#msgcontent').appendChild(newElement);
            messagemoi.classList.add('messagemoi');
            messagemoi.textContent = content;
            newElement.appendChild(messagemoi)
            leScroll()

            break;

        case 'autre':
            newElement.classList.add(element, 'message');

            document.querySelector('#msgcontent').appendChild(newElement);

            messagemoi.classList.add('messageautre');
            messagemoi.textContent = content.pseudo + ' : ' + content.message;
            newElement.appendChild(messagemoi)

            messagemoi.addEventListener('click', () => {
                // madate(content.date)
                console.log(content.date);
            })
            leScroll()
            break;


        case 'oldMessages':
            newElement.classList.add('autre', 'message');

            document.getElementById('msgcontent').appendChild(newElement);
            messagemoi.classList.add('messageautre');
            messagemoi.textContent = content.sender + ' : ' + content.content;
            newElement.appendChild(messagemoi)

            if(content.img){
                messagemoi.id= content.img
                socket.emit('searchImage', content.img)
            }


            info.textContent = content.date
            info.classList.add('infoautre')
            // console.log(content.img);


            newElement.appendChild(info)

            messagemoi.addEventListener('click', () => {
                // madate(content.date)
                info.style.display = "flex"

                info.addEventListener('click', () => {
                    info.style.display = "none"
                })
            })
            leScroll()

            break;

        case 'oldMessagesMe':
            newElement.classList.add('moi', 'message');

            document.getElementById('msgcontent').appendChild(newElement);
            messagemoi.classList.add('messagemoi');
            if(content.img){
                messagemoi.id= content.img
                socket.emit('searchImage', content.img)
            }
            messagemoi.textContent = content.content;
            newElement.appendChild(messagemoi)

            

            info.textContent = content.date
            info.classList.add('infomoi')
            // console.log(content.img);

            newElement.appendChild(info)


            messagemoi.addEventListener('click', () => {
                // madate(content.date)
                // console.log(date);
                info.style.display = "flex"

                info.addEventListener('click', () => {
                    info.style.display = "none"
                })
            })
            leScroll()
            break;

        case 'imageautre':
            newElement.classList.add('autre', 'message');
            document.getElementById('msgcontent').appendChild(newElement);

            let imgview = document.createElement('img')
            imgview.classList.add('img')
            imgview.src = content

            newElement.appendChild(imgview)

            imgview.addEventListener('click', () => {
                voirImage(imgview.src)

            })
            leScroll()

            break;

        case 'oldimgautre':
            newElement.classList.add('autre', 'message');
            document.getElementById('msgcontent').appendChild(newElement);
            
           
           


                let oldimgautre = document.createElement('img')
                oldimgautre.classList.add('img')
                oldimgautre.src = content

                newElement.appendChild(oldimgautre)

                oldimgautre.addEventListener('click', () => {
                    voirImage(oldimgautre.src)

                })
           




            leScroll()

            break;

        case 'oldimgme':
            newElement.classList.add('moi', 'message');
            document.getElementById('msgcontent').appendChild(newElement);

          


                let oldimgme = document.createElement('img')
                oldimgme.classList.add('img')
                oldimgme.src = content

                newElement.appendChild(oldimgme)

                oldimgme.addEventListener('click', () => {
                    voirImage(oldimgme.src)

                })
            
            leScroll()

            break;


    }



}

function leScroll() {
    document.querySelector('#msgcontent').scrollTop = 10000000000
}

function notification() {
    let audio = new Audio('notif.mp3')
    audio.play()

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

            img.addEventListener('click', () => {
                voirImage()
                console.log(img.src);
            })


            img.file = file;
        

            let reader = new FileReader();

            reader.onload = (function (aImg) {

                return function (e) {
                    let src = e.target.result;
                    // socket.emit('testimg', src)
                    // monupload(src)
                    aImg.src = e.target.result;

                    let obj = {
                        name : 'test',
                        url: src
                    }

                    fetch('https://192.168.1.13:5555/',{
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify(obj)
                    },(err)=>{
                        console.log(err)
                        console.log('ya quoi');;
                    })

                };
            })(img);

            reader.readAsDataURL(file);



        }

    }

}

function monupload(files){
    socket.emit("upload", files)
     
}


// function cUneImage(files){

//     socket.emit('testimg', files)
// }


function voirImage(src) {

    console.log('click');
    let fond = document.createElement('div')
    fond.id = 'fondImage'
    document.querySelector('#content').appendChild(fond)

    let croix = document.createElement('div')
    croix.id = 'fermer'
    croix.textContent = "❌"
    croix.style.position = "absolute"
    croix.style.top = 0
    fond.appendChild(croix)

    let img = document.createElement('img')
    img.src = src
    img.style.width = "96%"


    fond.appendChild(img)

    croix.addEventListener('click', () => {
        fond.remove()
    })
}


function listeUsers() {

    socket.emit('vaChercherLesUsers')

}

function voiciUsers(users) {
    let header = document.querySelector('#header')
    //  document.querySelector('#interloc').style.display = "none"
    document.querySelector('#cloche').style.display = "none"
    document.querySelector('#lesUsers').style.display = "none"
    let conteneur = document.createElement('div')
    header.appendChild(conteneur)
    conteneur.id = 'user'
    let fermer = document.createElement('div')
    fermer.id = "fermer"
    fermer.textContent = "❌"
    conteneur.appendChild(fermer)

    fermer.addEventListener('click', () => {
        header.removeChild(conteneur)
        // document.querySelector('#interloc').style.display = "flex"
        document.querySelector('#cloche').style.display = "block"
        document.querySelector('#lesUsers').style.display = "block"



    })



    users.forEach(user => {

        console.log(user);

        if (user.pseudo === null) {
            // rien
        } else if (user.pseudo === undefined) {
            // rien
        } else if (user.pseudo === pseudo) {
            // rien
        } else {

            let leuser = document.createElement('div')
            leuser.classList.add('user')
            leuser.textContent = user.pseudo
            leuser.addEventListener('click', () => {


                _join(user.pseudo)
                header.removeChild(conteneur)
                // document.querySelector('#interloc').style.display = "flex"
                document.querySelector('#cloche').style.display = "block"
                document.querySelector('#lesUsers').style.display = "block"
            })
            conteneur.appendChild(leuser)
        }

    });
}







// PARTIE NOTIF ? LISTE DES CONVS ------------------------------------//

let cloche = document.querySelector('#cloche')


cloche.addEventListener('click', () => {

    document.querySelector('#lesUsers').style.display = "none"

    cloche.style.display = "none"

    socket.emit('messagerie', (pseudo))

    document.querySelector('#interloc').style.display = "none"

    let messagerie = document.createElement('div')
    messagerie.id = "messagerie"
    header.appendChild(messagerie)

    let fermer = document.createElement('div')
    fermer.id = "fermer"
    fermer.textContent = "❌"
    messagerie.appendChild(fermer)

    fermer.addEventListener('click', () => {
        header.removeChild(messagerie)
        document.querySelector('#interloc').style.display = "flex"
        cloche.style.display = "block"
        document.querySelector('#lesUsers').style.display = "block"
        socket.emit('resetNotifs')

    })
})

socket.on('conversation', (data) => {

    if (data.nbr === 0) {


        let messagerie = document.querySelector('#messagerie')
        let conv = document.createElement('div')
        conv.classList.add('conv')

        conv.textContent = data.user + ' : ' + data.msg

        conv.addEventListener('click', () => {
            cloche.style.display = "block"
            _join(data.user)
        })
        messagerie.appendChild(conv)


    } else {
        let messagerie = document.querySelector('#messagerie')
        let conv = document.createElement('div')
        conv.classList.add('conv')

        conv.textContent = data.user + ' : ' + data.msg

        let manotif = document.createElement('div')
        manotif.classList.add("notif")
        manotif.textContent = data.nbr
        conv.appendChild(manotif)
        conv.style.backgroundColor = "grey"

        conv.addEventListener('click', () => {
            cloche.style.display = "block"
            _join(data.user)
        })
        messagerie.appendChild(conv)
    }




    console.log(data.user + ' notif = ' + data.nbr);

})

socket.on('nbrNotif', (data) => {

    if (data === 0) {

        let notif = document.querySelector('#notif')
        notif.style.display = 'none'


    } else {
        let notif = document.querySelector('#notif')
        notif.style.display = 'block'
        notif.textContent = data
    }
})

socket.on('notifEnDirect', () => {
    socket.emit('searchnotif')
    notification()
})






// INFORMATION MESSAGE