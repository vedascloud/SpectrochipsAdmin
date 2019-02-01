var userFunction = require('../functions/user');
const Busboy = require('busboy');
const fileUpload = require('express-fileupload');
var adminFun = require('../functions/admin');

module.exports = function(app,io) {


	io.on('connection', function(socket){

		console.log("Client Connected");
        connectCounter++;

        socket.on('disconnect',function(){
            console.log('user disconnected');
            connectCounter--;
        });

        console.log('connected client size..',connectCounter);

  		socket.on('test',function () {
			console.log('test data..');
			io.emit('test','welcome to vedas sample TCP connection');
        });

  		socket.on('addchart',function(cha){
  		    console.log('add chart',cha);
  		    charts.createCharts(cha,(result) => {
  		        console.log('add charts...',result);

                charts.loadCharts((result2) => {
                    console.log('before sending', result2);
                    io.emit('charts', result2);
                })
            })
        });

  		socket.on('fetch',function (upchart) {
            console.log('file is updating..', upchart);
            charts.updateCharts(upchart, (result) => {
                console.log('result of update chart..', result);
                //socket.broadcast.emit('broadcast', 'hello friends!');
                charts.loadCharts((result2) => {
                    console.log('before sending', result2);
                    io.emit('charts', result2);
                })
            });
        });

  		socket.on('charts',function (upchart) {

  		    if(typeof upchart == 'undefined') {

                charts.loadCharts((result) => {
                    console.log('load charts info..', result);
                    io.emit('charts', result);
                });

            }else{

                console.log('file is updating..', upchart);
                charts.updateCharts(upchart, (result) => {
                    console.log('result of update chart..', result);
                    charts.loadCharts((result2) => {
                        console.log('before sending',result2);
                        io.emit('charts', result2);
                    })
                });

            }
        });

  		socket.on('add user',function (data) {
			console.log('user data..',data);

			userFunction.userregister(data.name,data.username,data.password,function (result) {
				console.log('result set from db',result);
					io.emit('register user',result)
                    //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });

        });

        socket.on('login',function (data) {
            console.log('user login data..',data);

            userLogin.userLogin(data.username,data.password,function (result) {
                console.log('result set from db',result);
                io.emit('login',result);

                //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });

        });
        socket.on('change',function (data) {
            console.log('user change pass data..',data);

            userFunction.changePassword(data.username,data.oldpassword,data.newpassword,function (result) {
                console.log('result set from db',result);
                io.emit('change',result)
                //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });

        });
		socket.on('forgot',function (data) {
            console.log('user forgot pass.',data);

            userLogin.userForgot(data.username,function (result) {
                console.log('result set from db',result);
                io.emit('forgot',result)
                //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });
        })
        socket.on('file',function (data) {
			console.log('file input data...',data);
            var t=Date.now();
            fs.writeFile('/Users/apple/Desktop/TCPServer/public/images/'+t+data.filename, data.byte, function(err) {
                if (err){
                    throw err;
                    io.emit('file',{result:'error',message:'file not saved'});
				} else{
                    console.log('It\'s saved!');
                    io.emit('file',{result:'success',url:'http://192.168.1.103:8080/image/'+t+data.filename});
				}
        });
        })

	});

	io.on('disconnect',function () {

        connectCounter--;
    });

	app.get('/',(req,res) => {

        const pdfshift = require('pdfshift')('9b06e5eda13444a2a38d39e6fb965c06');
        const fs = require('fs');

        let data = fs.readFileSync('./index.html', 'utf8');

        pdfshift.prepare(data)
            .protect({
            user_password: 'user',
            owner_password: 'owner',
            no_print: false
            }).then(function (binary_file) {
            fs.writeFile('./result.pdf', binary_file, "binary", function (err,suc) {
                if(err)
                    console.log(err);
                else
                    console.log(suc);
            })
        }).catch(function({message, code, response, errors = null}) {
            if (message)
                console.log(message);
                //res.render('index',{title:message})
            else if(code)
                console.log(code);
            else if(response)
                console.log(response);
            else
                console.log(errors);
        });
	   res.render('index',{title:'SpectroChips'});
    });

	app.get('/products',(req,res) => {
       res.json({records:[{id:"100",
            name: "T-Shirt",
            description:"Vedas T-shirt.",
            price: 999,
            category_id:25,
            category_name:"Wearing"}]});
    });

    /*app.post('/api/photo',function(req,res){
        var path;
        var storage =   multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null,'./publicjsonfiles/test');
            },
            filename: function (req, file, callback) {
                 path = 'UrineTestItem' + '-' + Date.now()+'.json';
                callback(null, path);
            }
        });

        var upload = multer({ storage : storage}).single('userPhoto');

        upload(req,res,function(err) {
            console.log('request dat....',req.body);
            console.log('path value.....', path);
            if(err) {
                console.log(err);
                return res.end("Error uploading file.");
            }
            admin.find({username:req.body.username}, (err, suc) => {
                if (err) {
                    console.log(err);
                } else if (suc.length > 0) {

                    pjson.find({}, (er, len) => {
                        if (er)
                            console.log(er);
                        else if (len.length > 0) {
                            pjson.update({}, {
                                $push: {
                                    testFiles: {
                                        filename: path,
                                        url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path,
                                        timestamp: Date.now()
                                    }
                                }
                            }, (em, sm) => {
                                if (em) {
                                    console.log(em);
                                } else {
                                    console.log(sm);
                                    pjson.update({}, {$set: {updatedBy: req.body.username}});
                                    res.json({
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
                                    timestamp: Date.now()
                                }],
                                updatedBy: req.body.username
                            });
                            pt.save((success) => {
                                console.log(success);
                                res.json({
                                    result: 'success',
                                    message: 'file uploaded',
                                    url: 'http://18.204.210.99:8080/spectrochips/files/test/' + path
                                });
                            })
                        }
                    });
                }
            });
        });
    });*/

    app.post('/products/create',(req,res) => {
        console.log('we recieved it...');
        res.json({message:'Product was created'});
    });

    app.get('/category',(req,res) => {
          res.json({records:[{id:"100",
            name: "Books",
            description:"Vedas T-shirt.",
            id:"1"}]});
    });

    app.get('/products/:id',(req,res) => {
        console.log('we recieved');
        res.json({id:"100",
            name: "T-Shirt",
            description:"Vedas T-shirt.",
            price: 999,
            category_id:25,
            category_name:"Wearing"})
    });

    app.post('/products/update',(req,res) => {
        console.log('req body...',req.body);
        res.json({message:'product was updated'});
    });

    app.post('/products/delete',(req,res) => {
        console.log('req body...',req.body);
        res.json({message:'product was deleted'});
    });

    app.post('/spectrochips/user',(req,res) => {
        console.log('request body...',req.body);
        if(typeof req.body.userID == 'undefined' || typeof req.body.username == 'undefined'){
            res.json({result:'error',message:'please provide the valid data'});
        }else{
            userFunction.createUser(req.body,(result) => {
                console.log('result from function..',result);

                    res.json(result);
            })
        }
    });

    app.get('/spectrochips/user/:id',(req,res) => {
        console.log('we recieved');
        userFunction.singleUser(req.params.id,(result) => {
            res.json(result);
        })
    });

    app.put('/spectrochips/user', (req,res) => {
        console.log('request body..',req.body);
        if(typeof req.body.userID == 'undefined' || typeof req.body.username == 'undefined'){
            res.json({result:'error',message:'provide the valid data'});
        }else{
            userFunction.updateUser(req.body,(result) => {
                res.json(result);
            })
        }
    });

    app.delete('/spectrochips/user/:id', (req,res) => {
        console.log('user id to delete....',req.params.id);

       if(typeof req.params.id == 'undefined'){
           res.json({result:'error',message:'provide the userID'});
       }else{
           userFunction.deleteUser(req.params.id,(result) => {
               res.json(result);
           })
       }
    });

    app.get('/users/roles',(req,res) => {

        res.json({records:[{id:1,name:'tester',description:'tester can test it'}]});
    });

    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    }));

    app.get('/spectrochips/file/download/:id/:testname/:filename', function(req, res){
        console.log('resource to download file...',req.params.id);
        if(typeof req.params.id == 'undefined'){
            res.json({result:'error',message:'provide the download resource'});
        }else {
            var file = '../spectrochipsAPP/user/' + req.params.id + '/'+ req.params.testname +'/'+req.params.filename;
            res.download(file); // Set disposition and send it.
        }
    });

    app.get('/spectrochips/admin/download/:testname/:filename', function(req, res){
        console.log('resource to download file...',req.params.id);
        if(typeof req.params.testname == 'undefined'){
            res.json({result:'error',message:'provide the download resource'});
        }else {
            var file = '../spectrochipsAPP/publicjsonfiles/' + '/'+ req.params.testname +'/'+req.params.filename;
            res.download(file); // Set disposition and send it.
        }
    });

    app.post('/spectrochips/admin/json/test/upload', (req,res) => {
        console.log('request body..',req.body);
        if( typeof req.files.jsonfile == 'undefined' ){
            res.json({result:'error',message:'please provide the valid data'});
        }else{
            const user = req.body.username;
            var busboy = new Busboy({headers: req.headers});
            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
                file.on('data', function(data) {
                    console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
                });
                file.on('end', function() {
                    console.log('File [' + fieldname + '] Finished');
                });
            });
            busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                console.log('Field [' + fieldname + ']: value: ' + inspect(val));
            });
            // The file upload has completed
            busboy.on('finish', function () {
                console.log('Upload finished');
                const file = req.files.jsonfile;
                console.log(file);

                if (file.mimetype === 'application/json') {
                    adminFun.adminTestFiles(user, file, (result) => {
                        console.log(result);
                        res.json(result);
                    });
                } else {
                    res.json({result: 'error', message: 'Accept only JSON files'});
                }
            });

            req.pipe(busboy);
        }
    });

    app.post('/spectrochips/admin/json/sequence/upload', (req,res) => {
        console.log('request body..',req.body.username);
        if(typeof req.body.username == 'undefined' || typeof req.files.jsonfile == 'undefined' ){
            res.json({result:'error',message:'please provide the valid data'});
        }else{
            const user = req.body.username;
            var busboy = new Busboy({headers: req.headers});

            // The file upload has completed
            busboy.on('finish', function () {
                console.log('Upload finished');
                const file = req.files.jsonfile;
                console.log(file);

                if (file.mimetype === 'application/json') {
                    adminFun.adminSeqFiles(user, file, (result) => {
                        console.log(result);
                        res.json(result);
                    });
                } else {
                    res.json({result: 'error', message: 'Accept only JSON files'});
                }
            });

            req.pipe(busboy);
        }
    });

    app.get('/spectrochips/users',(req,res)=>{
       userFunction.fetchUsers((result) => {
           res.json(result);
       })
    });

    app.post('/spectrochips/login',(req,res) => {
        console.log('req body...',req.body);
        if(typeof req.body.userID == 'undefined'){
            res.json({result:'error',message:'please provide the UserID'});
        }else{
            userFunction.checkUser(req.body,(result) => {
                console.log('result from func..',result);
                res.json(result);
            })
        }
    });

    app.post('/spectrochips/admin/login',(req,res) => {
        console.log('req body...',req.body);
        if(typeof req.body.username == 'undefined'){
            res.json({result:'error',message:'please provide the UserID'});
        }else{
            adminFun.adminFunction(req.body,(result) => {
                console.log('result from func..',result);
                res.json(result);
            })
        }
    });

    app.post('/spectrochips/user/json/test/upload', function (req, res, next) {

        // This grabs the additional parameters so in this case passing in
        // "element1" with a value.
        if(typeof req.body.userID === 'undefined' || typeof req.files.jsonfile === 'undefined'){
            res.json({result:'error',message:'no content found'});
        }else {

            const user = req.body.userID;
            var busboy = new Busboy({headers: req.headers});

            // The file upload has completed
            busboy.on('finish', function () {
                console.log('Upload finished');
                const file = req.files.jsonfile;
                console.log(file);

                if (file.mimetype === 'application/json') {
                    userFunction.uploadTestFiles(user, file, (result) => {
                        console.log(result);
                        res.json(result);
                    });
                } else {
                    res.json({result: 'error', message: 'Accept only JSON files'});
                }
            });

            req.pipe(busboy);
        }
    });

    app.post('/spectrochips/user/json/sequence/upload', function (req, res, next) {

        // This grabs the additional parameters so in this case passing in
        // "element1" with a value.
        if(typeof req.body.userID === 'undefined' || typeof req.files.jsonfile === 'undefined'){
            res.json({result:'error',message:'no content found'});
        }else {

            const user = req.body.userID;
            var busboy = new Busboy({headers: req.headers});

            // The file upload has completed
            busboy.on('finish', function () {
                console.log('Upload finished');
                const file = req.files.jsonfile;
                console.log(file);

                if (file.mimetype === 'application/json') {
                    userFunction.uploadSeqFiles(user, file, (result) => {
                        console.log(result);
                        res.json(result);
                    });
                } else {
                    res.json({result: 'error', message: 'Accept only JSON files'});
                }
            });

            req.pipe(busboy);
        }
    });

    app.post('/spectrochips/user/json/data',(req,res) => {

      if(typeof req.body.userID === 'undefined' || typeof req.body.structure === 'undefined'){
            res.json({result:'error',message:'no content found'});
        }else{
            console.log('get ready to prepare a JSON file');
            userFunction.createJsonFile(req.body.userID,req.body.structure,(result) => {
                res.json(result);
            });
        }
    });

    app.post('/spectrochips/sequence/json/delete',(req,res) => {
       if( typeof req.body.userID === 'undefined' || typeof req.body.url === 'undefined'){
           res.json({result:'error',message:'no content found'});
       }else {
           adminFun.deleteSeqfiles(req.body,(result) => {
               console.log('result...',result);
               res.json(result);
           })
       }
    });

    app.post('/spectrochips/test/json/delete',(req,res) => {
        if( typeof req.body.userID === 'undefined' || typeof req.body.url === 'undefined'){
            res.json({result:'error',message:'no content found'});
        }else {
            adminFun.deleteTestfiles(req.body,(result) => {
                console.log('result...',result);
                res.json(result);
            })
        }
    });

    app.post('/spectrochips/admin/test/delete',(req,res) => {
        if(typeof req.body.url === 'undefined'){
            res.json({result:'error',message:'no content found'});
        }else {
            adminFun.deletePublicTestfiles(req.body,(result) => {
                console.log('result...',result);
                res.json(result);
            })
        }
    });

    app.post('/spectrochips/admin/sequence/delete',(req,res) => {
        if(typeof req.body.url === 'undefined'){
            res.json({result:'error',message:'no content found'});
        }else {
            adminFun.deletePublicSeqfiles(req.body,(result) => {
                console.log('result...',result);
                res.json(result);
            })
        }
    });

    app.post('/spectrochips/admin/test/update',(req,res) => {

        var busboy = new Busboy({headers: req.headers});

        // The file upload has completed
        busboy.on('finish', function () {
            console.log('Upload finished');
            const file = req.files.jsonfile;
            console.log(file);

            if (file.mimetype === 'application/json') {
                //admin.updateAdminTestfiles(req.body.username,req.body.url)
                adminFun.updateAdminTestfiles(req.body.username, req.body.url,file, (result) => {
                    console.log(result);
                    res.json(result);
                });
            } else {
                res.json({result: 'error', message: 'Accept only JSON files'});
            }
        });

        req.pipe(busboy);

    });

    app.post('/spectrochips/admin/sequence/update',(req,res) => {

        var busboy = new Busboy({headers: req.headers});

        // The file upload has completed
        busboy.on('finish', function () {
            console.log('Upload finished');
            const file = req.files.jsonfile;
            console.log(file);

            if (file.mimetype === 'application/json') {
                //admin.updateAdminTestfiles(req.body.username,req.body.url)
                adminFun.updateAdminSequencefiles(req.body.username, req.body.url,file, (result) => {
                    console.log(result);
                    res.json(result);
                });
            } else {
                res.json({result: 'error', message: 'Accept only JSON files'});
            }
        });

        req.pipe(busboy);

    });

    app.get('/spectrochips/public/json',(req,res) => {
        adminFun.fetchPublic((result) => {
            console.log(result);
            res.json(result);
        })
    })
};

