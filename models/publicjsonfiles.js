var mongoose = require('../connection');
var Schema = mongoose.Schema;

var fileSchema = new Schema({

    testFiles:[{
        filename:String,
        url: String,
        downloadLink:String,
        timestamp: Date
    }],
    sequenceFiles:[{
        filename:String,
        url:String,
        downloadLink:String,
        timestamp:Date
    }],
    updatedBy:{
        type:String,
        required:true
    }

});

module.exports = mongoose.model('Publicjsonfile', fileSchema);
