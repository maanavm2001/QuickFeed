var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let teacherSchema = new Schema({
    name: {
      type: String
    },
    email: {
      type: String
    },
    salt: {
      type: String
    },
    hash: {
      type: String
    },
    classes: [{
        type: Schema.Types.ObjectId, ref: 'Class' 
    }],
  });


  module.exports = mongoose.model('Teacher', teacherSchema);