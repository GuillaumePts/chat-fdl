const mongoose = require('mongoose');

let chatSchema = new mongoose.Schema({
   id_room:{
    type: String
   },
   sender:String,
   receiver: String,
   content: String,
   img: Object ,
   date: String,
   createdAt: Date
})

mongoose.model('chat', chatSchema);