const express = require('express');
const app = express();
const mongoose = require('mongoose')
const  https = require('https');
const fs = require('fs');

const server = https.createServer({ 
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert') 
 }, app);


// const ObjectId = mongoose.Types.ObjectId;

const mdp = require('./env');
// const { json } = require('express');


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
require('./models/image.model');
let User = mongoose.model('user');
let Room = mongoose.model('room');
let Chat = mongoose.model('chat');
let Image = mongoose.model('image');


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

// const io = new Server(https);

let connectedUsers = []
let lesconnecte = []
let notifEnDirects = []
let notifs = []


// CREATION DE LA SOCKET
io.on('connection', (socket) => {


    // CONNECTION
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
            notifEnDirects.push({
                pseudo: socket.pseudo,
                id: socket.id
            })



            searchNotifs()







        })
    })


    socket.on('vaChercherLesUsers', () => {
        searchUsers()
    })



    let receiver = ''


    // CHOIX DE LA CONVERSATION + LA REJOINDRE
    socket.on('select', (nom) => {



        rechercheRoom(nom, socket.pseudo)
        socket.emit('namespace', nom)
        receiver = nom



        if (lesconnecte.includes(nom)) {

            socket.emit('co', nom)
        } else {
            socket.emit('pasco', nom)

        }



    })





    // ENVOIE DES MESSAGES
    socket.on('message', (message, lereceiver) => {

        let d = new Date()
        let jour = d.getDate()
        let mois = d.getMonth()
        let annee = d.getFullYear()

        let heure = d.getHours()

        if (heure <= 9) {
            heure = '0' + d.getHours()
        }

        let minute = d.getMinutes()

        if (minute <= 9) {
            minute = '0' + d.getMinutes()
        }


        lereceiver = receiver

        let chat = new Chat();
        chat.id_room = socket.room.name;
        chat.content = message;
        chat.sender = socket.pseudo;
        chat.receiver = lereceiver;
        chat.createdAt = new Date()

        if (mois <= 9) {

            chat.date = jour + '/' + '0' + mois + '/' + annee + '   ' + heure + ':' + minute;
        } else {
            chat.date = jour + '/' + mois + '/' + annee + '   ' + heure + ':' + minute;
        }

        chat.save();



        notifs.push({
            lesender: socket.pseudo,
            lereceiver: lereceiver

        })

        notifEnDirects.forEach(leNotifié => {
            if (leNotifié.pseudo === lereceiver) {

                io.to(leNotifié.id).emit('notifEnDirect')
            }
        })


        socket.broadcast.to(socket.room.name).emit('messageView', {
            message: message,
            pseudo: socket.pseudo,
            date: chat.date
        })







    })




    // ENVOI D'IMAGES
    socket.on('testimg', (src) => {
        let lereceiver = receiver

        let image = new Image();
        image.id_room = socket.room.name;
        image.content = src;
        image.sender = socket.pseudo;
        image.receiver = lereceiver;
        image.save();






        let chat = new Chat();
        chat.id_room = socket.room.name;
        chat.content = '▶Photo';
        chat.img = image.id;
        chat.sender = socket.pseudo;
        chat.receiver = lereceiver;
        chat.save();

        notifs.push({
            lesender: socket.pseudo,
            lereceiver: lereceiver
        })

        notifEnDirects.forEach(leNotifié => {
            if (leNotifié.pseudo === lereceiver) {

                io.to(leNotifié.id).emit('notifEnDirect')
            }
        })




        socket.broadcast.to(socket.room.name).emit('imageview', src)
    })

    socket.on("upload", (file) => {
        

        

        let obj = {
            url : file
        }

        let string = JSON.stringify(obj)


        fs.appendFile("public/upload/image.json", string, (err)=>{

            if(err){
                console.log(err);
            }
        })
        

    });
     

    socket.on('searchImage', (id)=>{
        Image.findOne({
            _id : id
        },(err, photo)=>{
            socket.emit('afficheImage', {
                name : id,
                src: photo.content,
                sender: photo.sender,
            })
        })
    })



    // QUAND QUELQU'UN ECRIT
    socket.on('writting', (pseudo) => {
        socket.broadcast.emit('writting', pseudo);
    })


    // QUAND QUELQU'UN ARRETE D'ECRIRE
    socket.on('notWritting', () => {
        socket.broadcast.emit('notWritting');
    })


    // QUAND LA PERSONNE OUVRE SA MESSAGERIE
    socket.on('messagerie', (data) => {

        // console.log('recherche toutes les salles ou figure '+data);
        messageries(data)

    })

    // LANCEMENT DE LA RECHERCHE DE NOTIF
    socket.on('searchnotif', () => {
        searchNotifs()

    })


    // SUPPRIME LES MESSAGES VUE DU TABLEAU DES NOTIFS
    // socket.on('resetNotifs', () => {

    //     resetNotifs()
    // })




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








    // FUNCTION CREER UNE CONVERSATION 
    function creatRoom(lui, toi) {
        let room = new Room()
        room.name = lui + '/' + toi;
        room.user1 = toi;
        room.user2 = lui;
        room.save();
        socket.room = lui + '/' + toi;
        _joinRoom(socket.room)

    }





    // FUNCTION POUR REJOINDRE UNE CONVERSATION, RECUPERER LES ANCIENS MESSAGES
    function _joinRoom(room) {



        if (notifs.length === 0) {



        } else {


            if (room.user1 === socket.pseudo) {



                resetNotifs(room.user2)

                // console.log("la cible est : "+room.user2);

            } else if (room.user2 === socket.pseudo) {



                resetNotifs(room.user1)


                // console.log("la cible est : "+room.user1);
            } else {

            }


        }



        socket.join(room.name)



        Chat.find({
            id_room: room.name
        }, (err, messages) => {

            if (messages === null) {

            } else {
                messages.forEach(message => {
                   

            

                    // if (message.img === undefined) {
                        if (message.sender === socket.pseudo) {
                            socket.emit('oldMessagesMe', {
                                content: message.content,
                                date: message.date,
                                sender: message.sender,
                                img: message.img
                            })

                        } else {
                            socket.emit('oldMessages', {
                                content: message.content,
                                date: message.date,
                                sender: message.sender,
                                img: message.img
                            })

                        }
                        
                    // } else {
                    //     Image.findOne({
                    //         _id: message.img
                    //     }, (err, limage) => {

                    //         if (limage.sender === socket.pseudo) {
                    //             socket.emit('oldimgme', limage.content)

                    //         } else {
                    //             socket.emit('oldimgautre', limage.content)

                    //         }
                    //     })
                    // }

                });
            }


        })




    }





    // FUNCTION DETERMINE SI LA CONVERSATION EXISTE OU NON, SI NON ELLE LANCE LA FUNCTION QUI VA CREER LA CONVERSATION

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






    // FUNCTION QUI VA CHERCHER LA LISTE DES CONVERSATIONS D'UNE PERSONNE ET LUI RETOURNER LE DERNIER MESSAGE AVEC LA X PERSONNE 

    function messageries(pseudo) {

        Room.find({
            user1: pseudo
        }, (err, rooms1) => {
            if (rooms1) {



                rooms1.forEach(room1 => {
                    Chat.findOne({
                        id_room: room1.name
                    }, (err, messages) => {
                        if (messages === null) {
                            let x = 'pas de message avec ' + room1.user2
                            socket.emit('conversation', {
                                msg: x,
                                user: room1.user2,
                                nbr: 0

                            })
                        } else {

                            let nbrNotif = 0

                            notifs.forEach(notif => {
                                if (notif.lereceiver === socket.pseudo && notif.lesender === room1.user2) {

                                    nbrNotif++



                                }
                            })




                            if (messages.content.length > 5000) {

                                socket.emit('conversation', {
                                    msg: 'photo',
                                    user: room1.user2,
                                    nbr: nbrNotif

                                })
                            } else {
                                socket.emit('conversation', {
                                    msg: messages.content,
                                    user: room1.user2,
                                    nbr: nbrNotif
                                })
                            }
                        }
                    }).sort({
                        $natural: -1
                    })
                })



            }
        })
        Room.find({
            user2: pseudo
        }, (err, rooms2) => {
            if (rooms2) {


                rooms2.forEach(room2 => {

                    Chat.findOne({
                        id_room: room2.name
                    }, (err, messages) => {
                        if (messages === null) {
                            let x = 'pas de message avec ' + room2.user1
                            socket.emit('conversation', {
                                msg: x,
                                user: room2.user1,
                                nbr: 0
                            })
                        } else {

                            let nbrNotif = 0

                            notifs.forEach(notif => {
                                if (notif.lereceiver === socket.pseudo && notif.lesender === room2.user1) {

                                    nbrNotif++



                                }
                            })




                            if (messages.content.length > 5000) {

                                socket.emit('conversation', {
                                    msg: 'photo',
                                    user: room2.user1,
                                    nbr: nbrNotif
                                })
                            } else {
                                socket.emit('conversation', {
                                    msg: messages.content,
                                    user: room2.user1,
                                    nbr: nbrNotif
                                })
                            }

                        }
                    }).sort({
                        $natural: -1
                    })

                })

            }
        })

    }







    // FUNCTION QUI VA VERIFIER SI LA PERSONNE A DES NOTIFICATIONS DE NOUVEAUX MESSAGES EN CHERCHANT DANS LE TABLEAU DES NOTIFS

    function searchNotifs() {
        // let newTabNotif = notifs.filter(notif => notif.lesender !== undefined)
        // notifs = newTabNotif
        let nbrNotif = 0
        if (notifs.length === 0) {

        } else {
            notifs.forEach(notif => {

                if (notif.lereceiver === socket.pseudo) {

                    nbrNotif++



                }
            })

            socket.emit('nbrNotif', nbrNotif)
        }
    }






    // FUNCTION QUI SUPPRIME LES NOTIFICATION UNE FOIS VU PAR LA PERSONNE

    function resetNotifs(sender) {

        notifs.forEach(notif => {

            if (notif.lesender === sender && notif.lereceiver === socket.pseudo) {
                delete notif.lesender
                delete notif.lereceiver


            }
        })



        searchNotifs()

        let newTabNotif = notifs.filter(notif => notif.lesender !== undefined)
        notifs = newTabNotif
    }




    function searchUsers() {

        User.find((err, users) => {
            // console.log(users);
            socket.emit('voiciLesUsers', users)
        })
    }



})
















server.listen(9999, (req, res)=>{
    console.log("server ok ! : https://192.168.1.13:9999");
})