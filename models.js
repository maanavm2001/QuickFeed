const mongoose = require("mongoose");

const Schema = mongoose.Schema;


let studentSchema = new Schema({
  name: {
    type: String
  },
  username: {
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

let teacherSchema = new Schema({
    name: {
      type: String
    },
    username: {
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

let classSchema = new Schema({
    name: {
      type: String
    },
    teacher: {
        type: Schema.Types.ObjectId, ref: 'Teacher' 
    },
    students: [{
        type: Schema.Types.ObjectId, ref: 'Student' 
    }],
    messages: [{
        type: Schema.Types.ObjectId, ref: 'Message' 
    }],
    classlength: {
        type: Number
    },
    active: {
        type: Boolean
    }
});


const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Class = mongoose.model('Class', classSchema);
const Message = mongoose.model('Message', messageSchema);