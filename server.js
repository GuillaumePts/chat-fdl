const express = require('express');
const app = express();
const mongoose = require('mongoose')
const server = require('http').createServer(app);
// const fs = require('fs')


const ObjectId = mongoose.Types.ObjectId;

const mdp = require('./env');


try {
    // Connect to the MongoDB cluster
    mongoose.connect(
        mdp.mongoAtlasUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        () => console.log(" Mongoose is connected"),
    );
} catch (e) {
    console.log("could not connect");
}

require('./models/user.model');
require('./models/room.model');
require('./models/chat.model');
let User = mongoose.model('user');
let Room = mongoose.model('room');
let Chat = mongoose.model('chat');


app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
    User.find((err, users) => {
        if (users) {
            Room.find((err, room) => {
                if (room) {
                    res.render('index.ejs', {
                        users: users,
                        rooms: room
                    });
                } else {

                    res.render('index.ejs', {
                        users: users
                    });
                }
            });
        } else {
            Room.find((err, room) => {
                if (room) {
                    res.render('index.ejs', {
                        rooms: room
                    });
                } else {

                    res.render('index.ejs');
                }
            });
        }
    });
});

app.use(function (req, res, next) {
    res.setHeader('Content-type', 'text/html');
    res.status(404).send('Page introuvable !');
});




// SOCKET

let io = require('socket.io')(server, {
    maxHttpBufferSize: 1e8
});

let connectedUsers = []
let lesconnecte = []


io.on('connection', (socket) => {

    socket.on('pseudo', (pseudo) => {


        User.findOne({
            pseudo: pseudo
        }, (err, user) => {
            if (user) {
                socket.pseudo = pseudo;

            } else {
                let user = new User();
                user.pseudo = pseudo;
                user.save();
                socket.pseudo = pseudo;

            }


            connectedUsers.push(socket);
            lesconnecte.push(socket.pseudo)










        })
    })





    let receiver = ''


    socket.on('select', (nom) => {

        rechercheRoom(nom, socket.pseudo)
        socket.emit('namespace', nom)
        receiver = nom

        if(lesconnecte.includes(nom)){
            console.log(nom +' est co');
            socket.emit('co', nom)
        }else{
            socket.emit('pasco', nom)
            console.log(nom + ' est pas co');
        }
       
      

    })






    socket.on('message', (message, lereceiver) => {


        lereceiver = receiver

        let chat = new Chat();
        chat.id_room = socket.room.name;
        chat.content = message;
        chat.sender = socket.pseudo;
        chat.receiver = lereceiver;
        chat.save();




        socket.broadcast.to(socket.room.name).emit('messageView', {
            message: message,
            pseudo: socket.pseudo
        })



    })

    socket.on('testimg', (src, lereceiver) => {


        lereceiver = receiver

        let chat = new Chat();
        chat.id_room = socket.room.name;
        chat.content = src;
        chat.sender = socket.pseudo;
        chat.receiver = lereceiver;
        chat.save();



        socket.broadcast.to(socket.room.name).emit('imageview', src)
    })


    socket.on('writting', (pseudo) => {
        socket.broadcast.emit('writting', pseudo);
    })

    socket.on('notWritting', () => {
        socket.broadcast.emit('notWritting');
    })

    socket.on('messagerie', (data)=>{

        // console.log('recherche toutes les salles ou figure '+data);
        messageries(data)

    })




    socket.on('disconnect', () => {
        let index = connectedUsers.indexOf(socket);
        if (index > -1) {
            connectedUsers.splice(index, 1)
            //    io.emit('deco', socket.pseudo)
        }
        let index2 = lesconnecte.indexOf(socket.pseudo);
        if (index2 > -1) {
            lesconnecte.splice(index2, 1)
            //    io.emit('deco', socket.pseudo)
        }

    })

    //  FUNCTION 


    function creatRoom(lui, toi) {
        let room = new Room()
        room.name = lui + '/' + toi;
        room.user1 = toi;
        room.user2 = lui;
        room.save();
        socket.room = lui + '/' + toi;
        _joinRoom(socket.room)

    }

    function _joinRoom(room) {
        // socket.leaveAll();
        socket.join(room.name)



        Chat.find({
            id_room: room.name
        }, (err, messages) => {

            if (messages === null) {
                console.log('pas de message');
            } else {
                messages.forEach(message => {

                    if (message.sender === socket.pseudo) {
                        socket.emit('oldMessagesMe', message.sender, message.content)

                    } else {
                        socket.emit('oldMessages', message.sender, message.content)

                    }

                });
            }


        })




    }

    function rechercheRoom(lui, toi) {

        Room.findOne({
            name: lui + '/' + toi
        }, (err, room) => {
            if (room) {


                socket.room = room

                _joinRoom(room)

            } else {
                Room.findOne({
                    name: toi + '/' + lui
                }, (err, room) => {
                    if (room) {


                        socket.room = room
                        _joinRoom(room)
                    } else {
                        creatRoom(lui, toi)


                    }
                })
            }
        })

    }

    function messageries(pseudo){
 
   
        Room.find({
            user1 : pseudo 
        }, (err, rooms1) =>{
            if(rooms1){
          
                rooms1.forEach(room1 =>{
                    socket.emit('user1', room1.user2)
                })
            
            }else{
                
            }
        })
        Room.find({
            user2 : pseudo
        }, (err, rooms2) =>{
            if(rooms2){
                rooms2.forEach(room2 =>{
                    
                    socket.emit('user2', room2.user1)
                })
             
            }else{
                console.log("pas de conv");
            }
        })
    
    }

})














server.listen(9999, () => console.log('server ok ! : http://localhost:9999'));