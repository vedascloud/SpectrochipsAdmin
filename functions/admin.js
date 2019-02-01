var admin = require('../models/admin');
var pjson = require('../models/publicjsonfiles');
var User = require('../models/user');
var fs = require('fs');

exports.adminFunction = (data, callback) => {
    console.log('data', data);
    admin.find({username: data.username, password: data.password}, (err, suc) => {
        if (err) {
            console.log('err', err);
        } else {
            console.log(suc);
            if (suc.length > 0) {
                callback({result: 'success', message: 'successfully loggedin'});
            } else {
                callback({result: 'error', message: 'username or password wrong'});
            }
        }
    })
}

exports.adminTestFiles = (user, file, callback) => {

    function uploadToS3(file) {
        //var path = 'UrineTestItem-'+ Date.now() +'.json';
        var path = file.name;
        console.log('filename....',file.name);
        admin.find({username: user}, (err, suc) => {
            if (err) {
                console.log(err);
            } else if (suc.length > 0) {

                pjson.find({'testFiles.filename': file.name}, (er, sr) => {
                        if (er) {
                            console.log(er);
                            callback(er);
                        } else if (sr.length > 0) {
                            callback({result: 'error', message: 'filename alreay exists'});
                        }else{
                         file.mv('./publicjsonfiles/test/' + path, function (err) {
                        if (err)
                            console.log(err);
                        //res.send('File uploaded!');
                        pjson.find({}, (er, len) => {
                            if (er)
                                console.log(er);
                            else if (len.length > 0) {
                                pjson.update({}, {
                                    $push: {
                                        testFiles: {
                                            filename: path,
                                            url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path,
                                            downloadLink: 'http://18.204.210.99:8080/spectrochips/admin/download/test/' + path,
                                            timestamp: Date.now()
                                        }
                                    }
                                }, (em, sm) => {
                                    if (em) {
                                        console.log(em);
                                    } else {
                                        console.log(sm);
                                        pjson.update({}, {$set: {updatedBy: user}});
                                        callback({
                                            result: 'success',
                                            message: 'file uploaded',
                                            url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path
                                        });
                                    }
                                })
                            } else {
                                var pt = new pjson({
                                    testFiles: [{
                                        filename: path,
                                        url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path,
                                        downloadLink: 'http://18.204.210.99:8080/spectrochips/admin/download/test/' + path,
                                        timestamp: Date.now()
                                    }],
                                    updatedBy: user
                                });
                                pt.save((success) => {
                                    console.log(success);
                                    callback({
                                        result: 'success',
                                        message: 'file uploaded',
                                        url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path
                                    });
                                })
                            }
                        });
                    });
                }
            });
            } else {
                callback({result: 'error', message: 'you are not a Admin'});
            }
        })
    }

    // Begins the upload to the AWS S3
    uploadToS3(file);
};

exports.adminSeqFiles = (user, file, callback) => {

    function uploadToS3(file) {

       // var path = 'UrineTestItem-'+ Date.now() +'.json';
        var path = file.name;
        admin.find({username: user}, (err, suc) => {
            if (err) {
                console.log(err);
            } else if (suc.length > 0) {
                pjson.find({'sequenceFiles.filename': file.name}, (er, sr) => {
                    if (er) {
                        console.log(er);
                        callback(er);
                    } else if (sr.length > 0) {
                        callback({result: 'error', message: 'filename alreay exists'});
                    } else {

                        file.mv('./publicjsonfiles/sequence/' + path, function (err) {
                            if (err)
                                console.log(err);
                            //res.send('File uploaded!');
                            pjson.find({}, (er, len) => {
                                if (er)
                                    console.log(er);
                                else if (len.length > 0) {
                                    pjson.update({}, {
                                        $push: {
                                            sequenceFiles: {
                                                filename: path,
                                                url: 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path,
                                                downloadLink: 'http://18.204.210.99:8080/spectrochips/admin/download/sequence/' + path,
                                                timestamp: Date.now()
                                            }
                                        }
                                    }, (em, sm) => {
                                        if (em) {
                                            console.log(em);
                                        } else {
                                            pjson.update({}, {$set: {updatedBy: user}});
                                            callback({
                                                result: 'success',
                                                message: 'file uploaded',
                                                url: 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path
                                            });
                                        }
                                    })
                                } else {
                                    var pt = new pjson({
                                        sequenceFiles: [{
                                            filename: path,
                                            url: 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path,
                                            downloadLink: 'http://18.204.210.99:8080/spectrochips/admin/download/sequence/' + path,
                                            timestamp: Date.now()
                                        }],
                                        updatedBy: user
                                    });
                                    pt.save((success) => {
                                        console.log(success);
                                        callback({
                                            result: 'success',
                                            message: 'file uploaded',
                                            url: 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path
                                        });

                                    })
                                }
                            });

                        });
                    }
                });
            } else {
                callback({result: 'error', message: 'You are not a Admin'});
            }
        })
    }

    // Begins the upload to the AWS S3
    uploadToS3(file);
};

exports.updateAdminTestfiles = (user,url,file,callback) => {

    function uploadToS3(file) {
        //var path = 'UrineTestItem-'+ Date.now() +'.json';
        var path = file.name;
        admin.find({username: user}, (err, suc) => {
            if (err) {
                console.log(err);
            } else if (suc.length > 0) {
                pjson.find({'testFiles.filename': file.name}, (er, sr) => {
                    if (er) {
                        console.log(er);
                        callback(er);
                    } else if (sr.length > 0) {
                        callback({result: 'error', message: 'filename alreay exists'});
                    } else {

                var m = url.toString().replace("http://18.204.210.99:8080/spectrochips/files/", "");
                console.log('path of a file..', m);
                fs.unlink('../spectrochipsAPP/publicjsonfiles/' + m, (er, sc) => {
                    if (er)
                        console.log('error found,', er);
                    else console.log(sc);
                });
                        file.mv('./publicjsonfiles/test/' + path, function (err) {
                            if (err)
                                console.log(err);
                            //res.send('File uploaded!');
                            pjson.find({}, (er, len) => {
                                if (er)
                                    console.log(er);
                                else if (len.length > 0) {
                                    pjson.update({'testFiles.url': url}, {
                                        $set: {
                                            'testFiles.$.filename': path,
                                            'testFiles.$.url': 'http://18.204.210.99:8080/spectrochips/files/test/' + path,
                                            'testFiles.$.downloadLink': 'http://18.204.210.99:8080/spectrochips/admin/download/test/' + path,
                                            'testFiles.$.timestamp': Date.now()
                                        }
                                    }, (em, sm) => {
                                        if (em) {
                                            console.log(em);
                                        } else {
                                            console.log(sm);
                                            pjson.update({}, {$set: {updatedBy: user}});
                                            callback({
                                                result: 'success',
                                                message: 'file uploaded',
                                                url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path
                                            });
                                        }
                                    })
                                } else {
                                    var pt = new pjson({
                                        testFiles: [{
                                            filename: path,
                                            url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path,
                                            downloadLink: 'http://18.204.210.99:8080/spectrochips/admin/download/test/' + path,
                                            timestamp: Date.now()
                                        }],
                                        updatedBy: user
                                    });
                                    pt.save((success) => {
                                        console.log(success);
                                        callback({
                                            result: 'success',
                                            message: 'file uploaded',
                                            url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path
                                        });
                                    })
                                }
                            });

                        });
                    }
                });
            } else {
                callback({result: 'error', message: 'you are not a Admin'});
            }
        })
    }

    // Begins the upload to the AWS S3
    uploadToS3(file);
};

exports.updateAdminSequencefiles = (user,url,file,callback) => {
    function uploadToS3(file) {
        //var path = 'UrineTestItem-'+ Date.now() +'.json';
        var path = file.name;
        admin.find({username: user}, (err, suc) => {
            if (err) {
                console.log(err);
            } else if (suc.length > 0) {
                pjson.find({'testFiles.filename': file.name}, (er, sr) => {
                    if (er) {
                        console.log(er);
                        callback(er);
                    } else if (sr.length > 0) {
                        callback({result: 'error', message: 'filename alreay exists'});
                    } else {
                        var m = url.toString().replace("http://18.204.210.99:8080/spectrochips/files/", "");
                        console.log('path of a file..', m);
                        fs.unlink('../spectrochipsAPP/publicjsonfiles/' + m, (er, sc) => {
                            if (er)
                                console.log('error found,', er);
                            else console.log(sc);
                        });

                        file.mv('./publicjsonfiles/sequence/' + path, function (err) {
                            if (err)
                                console.log(err);
                            //res.send('File uploaded!');
                            pjson.find({}, (er, len) => {
                                if (er)
                                    console.log(er);
                                else if (len.length > 0) {
                                    pjson.update({'sequenceFiles.url': url}, {
                                        $set: {
                                            'sequenceFiles.$.filename': path,
                                            'sequenceFiles.$.url': 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path,
                                            'sequenceFiles.$.downloadLink': 'http://18.204.210.99:8080/spectrochips/admin/download/sequence/' + path,
                                            'sequenceFiles.$.timestamp': Date.now()
                                        }
                                    }, (em, sm) => {
                                        if (em) {
                                            console.log(em);
                                        } else {
                                            console.log(sm);
                                            pjson.update({}, {$set: {updatedBy: user}});
                                            callback({
                                                result: 'success',
                                                message: 'file uploaded',
                                                url: 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path
                                            });
                                        }
                                    })
                                } else {
                                    var pt = new pjson({
                                        testFiles: [{
                                            filename: path,
                                            url: 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path,
                                            downloadLink: 'http://18.204.210.99:8080/spectrochips/admin/download/sequence/' + path,
                                            timestamp: Date.now()
                                        }],
                                        updatedBy: user
                                    });
                                    pt.save((success) => {
                                        console.log(success);
                                        callback({
                                            result: 'success',
                                            message: 'file uploaded',
                                            url: 'http://18.204.210.99:8080/spectrochips/files/sequence/' + path
                                        });
                                    })
                                }
                            });

                        });
                    }
                });
            } else {
                callback({result: 'error', message: 'you are not a Admin'});
            }
        })
    }

    // Begins the upload to the AWS S3
    uploadToS3(file);
};

exports.deleteSeqfiles = (data, callback) => {
    console.log('data...', data);
    User.update(
        {userID: data.userID},
        {$pull: {'sequenceFiles': {url: data.url}}}, (err, suc) => {
            if (err) {
                console.log(err);
            } else {
                console.log(suc);
                var m = data.url.toString().replace("http://18.204.210.99:8080/spectrochips/user/json/files/", "");
                console.log('path of a file..', m);
                fs.unlink('../spectrochipsAPP/user/' + m, (er, sc) => {
                    if (er)
                        console.log('error found,', er);
                    else console.log(sc);
                });
                callback({result: 'success', message: 'successfully deleted'});
            }
        }
    );
};

exports.deleteTestfiles = (data, callback) => {
    console.log('data...', data);
    User.update(
        {userID: data.userID},
        {$pull: {'testFiles': {url: data.url}}}, (err, suc) => {
            if (err) {
                console.log(err);
            } else {
                console.log(suc);

                var m = data.url.toString().replace("http://18.204.210.99:8080/spectrochips/user/json/files/", "");
                console.log('path of a file..', m);
                fs.unlink('../spectrochipsAPP/user/' + m, (er, sc) => {
                    if (er)
                        console.log('error found,', er);
                    else console.log(sc);
                });
                callback({result: 'success', message: 'successfully deleted'});
            }
        }
    );
};

exports.fetchPublic = (callback) => {
    pjson.find({}, {_id: false, __v: false}, (err, data) => {
        if (err)
            console.log(err);
        else
            callback({result: 'success', files: data});
    })
};

exports.deletePublicTestfiles = (data,callback) => {
    pjson.update({},{$pull:{'testFiles': {url: data.url}}},(err,suc) => {
        if(err){
            console.log(err);
        }else{
            console.log(suc);
            var m = data.url.toString().replace("http://18.204.210.99:8080/spectrochips/files/", "");
            console.log('path of a file..', m);
            fs.unlink('../spectrochipsAPP/publicjsonfiles/' + m, (er, sc) => {
                if (er)
                    console.log('error found,', er);
                else console.log(sc);
            });
            callback({result: 'success', message: 'successfully deleted'});
        }
    })
};

exports.deletePublicSeqfiles = (data,callback) => {
    pjson.update({},{$pull:{'sequenceFiles': {url: data.url}}},(err,suc) => {
        if(err){
            console.log(err);
        }else{
            console.log(suc);
            var m = data.url.toString().replace("http://18.204.210.99:8080/spectrochips/files/", "");
            console.log('path of a file..', m);
            fs.unlink('../spectrochipsAPP/publicjsonfiles/' + m, (er, sc) => {
                if (er)
                    console.log('error found,', er);
                else console.log(sc);
            });
            callback({result: 'success', message: 'successfully deleted'});
        }
    })
};

