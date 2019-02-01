var User = require('../models/user');
var Pubjson = require('../models/publicjsonfiles');
var fs = require('fs');

exports.checkUser = (data,callback) => {

    console.log("request data...",data);
    User.findOne({userID:data.userID}).exec()
        .then((user) => {
            var result = [];
            console.log('user..',user);
            if(user == null){
                return result;
            }
            else {
               result.push(user.username);
               result.push(user.testFiles);
               result.push(user.sequenceFiles);
               return result;
            }
        })
        .then((result) => {
            if(result.length > 0) {
                return Pubjson.findOne({}, {_id: false, __v: false,updatedBy:false}).exec()
                    .then(function (issues) {

                        result.push(issues.testFiles);
                        result.push(issues.sequenceFiles);
                        return result;
                    })
            }else{
                return result;
            }
        })
        .then((result) => {
                if(result.length > 0) {
                    var testfiles = result[1];
                    var seqfiles = result[2];

                    callback({result: 'success',username: result[0] ,userJson: {testfiles:testfiles,sequenceFiles:seqfiles}, publicJson:{testfiles:result[3],sequenceFiles:result[4]}});
                }else{
                    callback({result:'error',message:'no user found'});
                }
        })

        .then(undefined, function(err){
            //Handle error
            callback(err);
        })
        .then(null,(err) => {
            callback(err);
        })
};

exports.createUser = (data,callback) => {
    User.find({userID:new RegExp(data.userID,'i')}).exec()
        .then((user) => {
            if(user.length > 0){
                console.log('user already found with this ID');
                callback({result:'error',message:'userID already exist'});
            }else{
                var usr = new User({
                    userID:data.userID,
                    username:data.username,
                    timestamp:Date.now()
                });
                usr.save((success) => {
                    console.log(success);
                    callback({result:'success',message:'user successfully created'});
                })
            }
            console.log('user found',user);
        })
        .then(undefined,(err) => {
            callback({result:'error',message:'userID already exist'});
        })
};

exports.updateUser = (data,callback) => {
  User.update({userID:data.userID},{$set:{username:data.username,timestamp:Date.now()}}).exec()
      .then((success) => {
        console.log('sucess..',success);
        callback({result:'success',message:'successfully updated'});
      })
};

exports.singleUser = (id,callback) => {
    User.findOne({userID:id},{_id:false,__v:false},(err,suc) => {
        if(err){
            callback(err);
        }else{
            callback(suc);
        }
    })
}

exports.deleteUser = (data,callback) => {
console.log('data...',data);


    User.findOne({userID:data},(err,user) => {
        if(err){
            //callback(err);
        }else if(user  == null){
            callback({result:'error',message:'no user found to delete'});
        }else{

            User.remove({userID:data},(eer,usuc) => {
                if(eer){

                }else{

                    callback({result: 'success', message: 'user deleted successfully'});
                }
            });
        }
    })
};

exports.fetchUsers = (callback) => {
  User.find({},{_id:false,__v:false}).exec()
      .then((users) => {
        callback({users:users});
      })
};

exports.uploadTestFiles = (user,file,callback) => {

    function uploadToS3(file) {

        //var path = Math.random().toString(36).replace('0.', '') + file.name;
        var path = file.name;

            User.find({userID:user},(err,suc) => {
                if(err){
                    console.log(err);
                }else if(suc.length >0 ){

                    var dir = './user/'+user;

                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);

                    }

                    var dir2 = './user/'+user+'/test';
                    if(!fs.existsSync(dir2)){
                        fs.mkdirSync(dir2);

                    }

                    file.mv('./user/'+user+'/test/'+path, function(err) {
                        if (err)
                            return callback(err);
                        //res.send('File uploaded!');
                        User.update({userID: user}, {
                            $push: {
                                testFiles: {
                                    filename: path, // 18.204.210.99
                                    url: 'http://18.204.210.99:8080/spectrochips/user/json/files/'+user + '/test/' + path,
                                    downloadLink:'http://18.204.210.99:8080/spectrochips/file/download/'+user+'/test/'+path,
                                    timestamp: Date.now()
                                }
                            }
                        }, (em, sm) => {
                            if (em) {
                                console.log(em);
                            } else {
                                callback({result: 'success', message: 'file uploaded', url: 'http://18.204.210.99:8080/spectrochips/user/json/files/' + user + '/test/' + path});
                            }
                        })
                    });
                }else{
                    callback({result:'error',message:'no user found with this Id'});
                }
            })
    }

    // Begins the upload to the AWS S3
    uploadToS3(file);
};

exports.uploadSeqFiles = (user,file,callback) => {

    function uploadToS3(file) {

        //var path = Math.random().toString(36).replace('0.', '') + file.name;
        var path = file.name;

        User.find({userID:user},(err,suc) => {
            if(err){
                console.log(err);
            }else if(suc.length >0 ){

                var dir = './user/'+user;

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);

                }

                var dir2 = './user/'+user+'/sequence';
                if(!fs.existsSync(dir2)){
                    fs.mkdirSync(dir2);

                }

                file.mv(dir2+'/'+path, function(err) {
                    if (err)
                        console.log(err);
                    //res.send('File uploaded!');
                    User.update({userID: user}, {
                        $push: {
                            sequenceFiles: {
                                filename: path, //18.204.210.99
                                url: 'http://18.204.210.99:8080/spectrochips/user/json/files/'+ user + '/sequence/' + path,
                                downloadLink:'http://18.204.210.99:8080/spectrochips/file/download/'+user+'/sequence/'+path,
                                timestamp: Date.now()
                            }
                        }
                    }, (em, sm) => {
                        if (em) {
                            console.log(em);
                        } else {
                            callback({result: 'success', message: 'file uploaded', url: 'http://18.204.210.99:8080/spectrochips/user/json/files/' + user + '/sequence/' + path});
                        }
                    })
                });
            }else{
                callback({result:'error',message:'no user found with this Id'});
            }
        })
    }

    // Begins the upload to the AWS S3
    uploadToS3(file);
};

exports.createJsonFile = (user,filedata,callback) => {

        var path = Math.random().toString(36).replace('0.', '') + '.json';

        User.find({userID:user},(err,suc) => {
            if(err){
                console.log(err);
            }else if(suc.length >0 ){

                var dir = './user/'+user;

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }

                    fs.writeFile('./user/'+user+'/'+path, JSON.stringify(filedata), function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log('file writing completed');
                    });

                        console.log("The file was saved!");

                        User.update({userID: user}, {
                        $push: {
                            jsonfiles: {
                                filename: path,
                                url: user + '/' + path,
                                timestamp: Date.now()
                            }
                        }
                    }, (em, sm) => {
                        if (em) {
                            console.log(em);
                        } else {
                            console.log(sm);
                            callback({result: 'success', message: 'file uploaded', url: '/' + user + '/' + path});
                        }
                    })
            }else{
                callback({result:'error',message:'no user found with this Id'});
            }
        })

};