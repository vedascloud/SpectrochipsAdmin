var mongoose = require('../connection');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    username: String,
    userID: { type: String,required: true, index: { unique: true, sparse: true }},
    timestamp : Date,
    testFiles:[{
        filename:String,
        url: String,
        downloadLink:String,
        timestamp:Date,
    }],
    sequenceFiles:[{
        filename:String,
        url: String,
        downloadLink:String,
        timestamp:Date
    }]
});

module.exports = mongoose.model('User', UserSchema);