const express = require('express');
const app = express();
const mongoose = require('mongoose')
const server = require('http').createServer(app);

const ObjectId = mongoose.Types.ObjectId;

const mdp = require('./env')

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

let io = require('socket.io')(server);

let connectedUsers = []


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

        })
    })

    let receiver = ''


    socket.on('select', (nom) => {
        console.log('tu as cliqué sur ' + nom + ' et tu es ' + socket.pseudo);
        rechercheRoom(nom, socket.pseudo)
        socket.emit('namespace', nom)
        receiver = nom

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




    socket.on('disconnect', () => {
        let index = connectedUsers.indexOf(socket);
        if (index > -1) {
            connectedUsers.splice(index, 1)
        }
    })


    function creatRoom(lui, toi) {
        let room = new Room()
        room.name = lui + '/' + toi;
        room.user1 = toi;
        room.user2 = lui;
        room.save();
        socket.room = lui + '/' + toi;
        _joinRoom(socket.room)
        console.log('1 : ' + socket.room);
    }

    function _joinRoom(room) {
        socket.leaveAll();
        socket.join(room.name)

        console.log(socket.pseudo + ' à rejoint la room ' + room.name);

        Chat.find({
            id_room: room.name
        }, (err, messages) => {

            if (messages === null) {
                console.log('pas de message');
            } else {
                messages.forEach(message => {

                    if (message.sender === socket.pseudo) {
                        socket.emit('oldMessagesMe', message.sender, message.content)
                        console.log('tu avais envoyé '+message.content +' à ' + message.receiver);
                    } else {
                        socket.emit('oldMessages', message.sender, message.content)
                        console.log('il t\'avait envoyé ' +message.content +' tu es ' + message.receiver);
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
                console.log('existe');

                socket.room = room

                _joinRoom(room)

            } else {
                Room.findOne({
                    name: toi + '/' + lui
                }, (err, room) => {
                    if (room) {
                        console.log('existe sous une autre forme');

                        socket.room = room
                        _joinRoom(room)
                    } else {
                        creatRoom(lui, toi)

                        console.log('va voir bdd');
                    }
                })
            }
        })

    }

})

//  FUNCTION 





server.listen(9999, () => console.log('server ok ! : http://localhost:9999'));