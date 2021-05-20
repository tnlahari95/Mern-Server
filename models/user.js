var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    username: {
        type: String,
        unique: true
    },
    password:  {
        type: String
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', User);