
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const server= require('http').createServer(app);

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

app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {


        res.render('index.ejs')
            
  

});

app.use(function (req, res, next) {
    res.setHeader('Content-type', 'text/html');
    res.status(404).send('Page introuvable !');
});

server.listen(9999, () => console.log('server ok ! : http://localhost:9999'));