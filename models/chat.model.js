const mongoose = require('mongoose');

let chatSchema = new mongoose.Schema({
   id_room:{
    type: String
   },
   sender:String,
   receiver: String,
   content: String
})

mongoose.model('chat', chatSchema);