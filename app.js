const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const http = require('http');
const appConfig = require('./config/appConfig');
const logger = require('./app/libs/loggerLib');
const routeLoggerMiddleware = require('./app/middlewares/routeLogger.js');
const globalErrorMiddleware = require('./app/middlewares/appErrorHandler');
const mongoose = require('mongoose');
const morgan = require('morgan');

const timeLib = require('./app/libs/timeLib');
const check = require('./app/libs/checkLib');

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);

app.use(express.static(path.join(__dirname, 'client')));

require('dotenv').config();

const modelsPath = './app/models';
const controllersPath = './app/controllers';
const libsPath = './app/libs';
const middlewaresPath = './app/middlewares';
const routesPath = './app/routes';

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

//Bootstrap models
fs.readdirSync(modelsPath).forEach(function(file) {
  if (~file.indexOf('.js')) require(modelsPath + '/' + file);
});
// end Bootstrap models
const MeetingModel = mongoose.model('Meeting');

// Bootstrap route
fs.readdirSync(routesPath).forEach(function(file) {
  if (~file.indexOf('.js')) {
    let route = require(routesPath + '/' + file);
    route.setRouter(app);
  }
});
// end bootstrap route

// calling global 404 handler after route

app.use(globalErrorMiddleware.globalNotFoundHandler);

// end global 404 handler

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
// start listening to http server
console.log(appConfig);
server.listen(appConfig.port);
server.on('error', onError);
server.on('listening', onListening);

// end server listening code

//socket io connection handler'
const socketLib = require('./app/libs/socketLib');
const socketServer = socketLib.setServer(server);
//end socketio connection handler

//scheduler to send an alert email to the user before the meeting begins
var cron = require('node-cron');
const email = require('./app/libs/emailLib');

cron.schedule('* * * * *', () => {
  let now = timeLib.now();
  let nowPlusOne = timeLib.nowWithOneMinute();
  MeetingModel.find({
    startDate: { $gt: now, $lte: nowPlusOne }
  })
    .populate('createdBy', 'firstName')
    .populate('userDetails', 'email firstName')
    .select()
    .lean()
    .exec((err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (!check.isEmpty(result)) {
          let userEmail = result[0].userDetails.email;
          let firstName = result[0].userDetails.firstName;
          let purpose = result[0].purpose;
          email.emailOnMeetingReminder(userEmail, firstName, purpose);
          console.log('Email is sent to the client just 1 min before the meeting begins');
        }
      }
    });
});

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10);
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(
        error.code + ':elavated privileges required',
        'serverOnErrorHandler',
        10
      );
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(
        error.code + ':port is already in use.',
        'serverOnErrorHandler',
        10
      );
      process.exit(1);
      break;
    default:
      logger.error(
        error.code + ':some unknown error occured',
        'serverOnErrorHandler',
        10
      );
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  'Listening on ' + bind;
  logger.info(
    `server listening on port: ${addr.port}`,
    `serverOnListeningHandler`,
    10
  );
  // console.log('current time in moment', timeLib.now());
  // console.log('current time with one minute', timeLib.nowWithOneMinute());
  // console.log('time converted to Asia timezone', timeLib.convertToLocalTime());
  // console.log('localTime', timeLib.getLocalTime());
  let db = mongoose.connect(appConfig.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

/**
 * database connection settings
 */
mongoose.connection.on('error', function(err) {
  console.log('database connection error');
  console.log(err);
  logger.error(err, 'mongoose connection on error handler', 10);
  //process.exit(1)
}); // end mongoose connection error

mongoose.connection.on('open', function(err) {
  if (err) {
    console.log('database error');
    console.log(err);
    logger.error(err, 'mongoose connection open handler', 10);
  } else {
    console.log('database connection open success');
    logger.info(
      'database connection open',
      'database connection open handler',
      10
    );
  }
  //process.exit(1)
}); // enr mongoose connection open handler

module.exports = app;
