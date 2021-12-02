var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let classSchema = new Schema({
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
    classlength: {
        type: Number
    },
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