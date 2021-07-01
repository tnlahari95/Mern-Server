const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//require('mongoose-currency').loadType(mongoose);
//const Currency = mongoose.Types.Currency;

/*var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: String,
        required: true
    }
}, {
    timestamps: true
});*/

const leaderSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    featured: {
        type: Boolean,
        default:false      
    },
    abbr: {
        type: String
    },
    designation: {
        type: String
    }
},{
    timestamps: true
});

var Leaders = mongoose.model('Leader', leaderSchema);

module.exports = Leaders;