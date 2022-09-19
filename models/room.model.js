const mongoose = require('mongoose');

let roomSchema = new mongoose.Schema({
    name : String,
    user1 : String,
    user2 : String
    
});

mongoose.model('room', roomSchema);