var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let sessionSchema = new Schema({
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    class: {
        type: Schema.Types.ObjectId,
            ref: 'Class'
    },
    date: {
        type: Date
    },
    active: {
        type: Boolean
    }
});

module.exports = mongoose.model('Class', classSchema);