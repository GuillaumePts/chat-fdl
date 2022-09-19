const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    pseudo: String 
});

mongoose.model('user', userSchema);