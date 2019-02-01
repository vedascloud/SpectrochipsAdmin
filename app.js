var express = require('express');
var bodyParser = require('body-parser');
var app      = express();
let cluster = require('cluster');
var port     = process.env.PORT || 8080;
var logger = require('morgan');
var io = require('socket.io');
var device = require('express-device');
let path       = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/spectrochips/files',express.static(__dirname + '/publicjsonfiles'));
app.use('/spectrochips/user/json/files',express.static(__dirname + '/user'));
app.use('/styles',express.static(__dirname + '/public/'));
app.use('/image',express.static(__dirname + '/routes/uploads/'));
app.use('/weightloss/excerciselist',express.static(__dirname + '/routes/sample'));
app.use(express.static(__dirname + '/JS'));
app.use(bodyParser.json());
app.use(logger('dev'));
//console.log(device);
if(cluster.isMaster) {

    //
    //	1.	Count the machine's CPUs.
    //
    let cpuCount = require('os').cpus().length;

    //
    // 	2.	When on the production server
    //
    if(process.env.NODE_ENV === 'production') {

        //
        //	1.	Get the amount of memory on Heroku. This variable is set
        //		by Heroku based on the type of account that you have.
        //
        let memory = (process.env.MEMORY_AVAILABLE * 1e6);

        //
        //	2. Get used memory on the system
        //
        let memory_used = (process.memoryUsage().rss * 2);

        //
        //	3.	calculate how many workers can we start to use ale the
        //		available power of the server.
        //
        //		-1 for good measure
        //
        cpuCount = (memory / memory_used).toFixed() - 1;
    }

    //
    //	3.	Create a worker for each CPU core.
    //
    while(cpuCount--)
    {
        cluster.fork();
    }

    //
    //	4.	Listen for when the process exits because of a crash, and spawn
    //		a new process in it place.
    //
    cluster.on('exit', function (worker) {

        //
        //	1.	If a worker dies, lets create a new one to replace him
        //
        cluster.fork();

        //
        //	->	Log what happened
        //
        console.log('Worker %d died :(', worker.id);

    });

    //require('./routes/routes')(app,socket);
}
else
{
    //
    //	1.	Create HTTP server.
    //

    //
    //	2.	Listen on provided port, on all network interfaces.
    //
    var listen = app.listen(port);
    var socket = io.listen(listen);

    //
    //	3.	React to error events
    //
    listen.on('error', onError);

    //
    //	4.	listen to incoming requests
    //
    listen.on('listening', onListening);

    require('./routes/routes')(app,socket);
}

//
//	Event listener for HTTP server "error" event.
//
function onError(error)
{
    if(error.syscall !== 'listen') {
        throw error;
    }

    //
    //	handle specific listen errors with friendly messages
    //
    switch(error.code)
    {
        case 'EACCES':
            console.error("Port %d requires elevated privileges", port);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error("Port %d is already in use", port);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

//
//	Event listener for HTTP server "listening" event.
//
function onListening() {

    //
    //	-> display in the console where to look for the server
    //
    console.log('Worker %d is listening on port %d', cluster.worker.id, port);
}

app.use(function(req, res, next) {
    /*var err = new Error('Not Found. Please use some other');
    err.status = 404;
    next(err);*/
    res.render(__dirname + '/public/index.hjs');
});
console.log('The App runs on port ' + port);