var mongoose = require('../connection');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    username: { type: String,required: true, index: { unique: true, sparse: true }},
    password: String,
    timestamp : Date
});

module.exports = mongoose.model('Admin', UserSchema);