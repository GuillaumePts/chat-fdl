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

socket.on('imageview', (src)=> {
   
    let imgview = document.createElement('img')
    imgview.src = src

    document.querySelector('#msgcontent').appendChild(imgview)
    
})

// socket.on('file', (data) =>{
    

//     let img = document.createElement('img')
//     img.src = data.file

//     document.querySelector('#msgcontent').appendChild(img)
   
// })




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

function handleFiles(files) {
   
    let imageType = /^image\//;
    for (let i = 0; i < files.length; i++) {
    let file = files[i];
    if (!imageType.test(file.type)) {
      alert("on prend que les images");
    }else{
     
      let img = document.createElement("img");
      img.style.width="200px"
      
   
      img.file = file;
      document.querySelector("#msgcontent").appendChild(img); 
      let reader = new FileReader();
     
      reader.onload = ( function(aImg) { 
        
      return function(e) {
        let src =  e.target.result;
        socket.emit('testimg',src )
       aImg.src = e.target.result; 
    
    }; 
   })(img);
 
  reader.readAsDataURL(file);

  
 
  }
  
  }
 }
// function readThenSendFile(data){

//     var reader = new FileReader();
//     reader.onload = function(evt){
//         var msg ={};
//         msg.username = "bite";
//         msg.file = evt.target.result;
//         msg.fileName = data.name;
//         socket.emit('base64 file', msg);
//     };
//     reader.readAsDataURL(data);
// }

// document.querySelector('#upload').addEventListener('change', function(e){
//     var data = e.target.files[0];
//     readThenSendFile(data);      
// });

// onkeypress="writting()" onblur="notWritting()"