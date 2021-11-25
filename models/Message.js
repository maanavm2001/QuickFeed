var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let messageSchema = new Schema({
    time: {
      type: Date
    },
    message: {
        type: String 
    },
    student: {
        type: Schema.Types.ObjectId, ref: 'Student' 
    },
    class: {
        type: Schema.Types.ObjectId, ref: 'Classs' 
    },
  });

  module.exports = mongoose.model('Message', messageSchema);