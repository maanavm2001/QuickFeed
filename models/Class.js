var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let classSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: {
        type: String
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }],
    active: {
        type: Boolean
    },
    semestername: {
        type: String
    },
    description: {
        type: String
    }
});

module.exports = mongoose.model('Class', classSchema);