const mongoose = require('mongoose');

let imageSchema = new mongoose.Schema({
   id_room:{
    type: String
   },
   sender:String,
   receiver: String,
   content: String,
   date: String,
   createdAt: Date
})

mongoose.model('image', imageSchema);