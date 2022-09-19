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


    User.find((err, users) =>{
        
        res.render('index.ejs',{
            users:users,
        });
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
            console.log(connectedUsers.value);
        })
    })

    socket.on('disconnect', () => {
        let index = connectedUsers.indexOf(socket);
        if (index > -1) {
            connectedUsers.splice(index, 1)
        }
    })

})

server.listen(9999, () => console.log('server ok ! : http://localhost:9999'));