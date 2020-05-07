const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();
var cron = require('node-cron');
const timeLib = require('./timeLib');
// const email = require('./emailLib');
//model
const MeetingModel = mongoose.model('Meeting');
const tokenLib = require('./tokenLib');
const check = require('./checkLib');
const response = require('./responseLib');
// const redisLib = require("./redisLib");

let setServer = server => {
  let allOnlineUsers = [];
  let io = socketio.listen(server);

  let myIo = io.of('');
  //main event handler
  myIo.on('connection', socket => {
    console.log('on connection -- emitting verify user');
    console.log('verify user is emitted');
    socket.emit('verifyUser', '');

    //code to verify the user and make him online

    socket.on('set-user', authToken => {
      tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
        if (err) {
          socket.emit('auth-error', {
            status: 500,
            error: 'Please provide correct auth token'
          });
        } else {
          let currentUser = user.data;
          console.log('currentUser');
          console.log(currentUser);
          //setting socket userId
          socket.userId = currentUser.userId;
          console.log('socket userId', socket.userId);

          if (currentUser.userRole == 'normal') {
            allOnlineUsers.push(currentUser);
          }
          io.emit('online-user-list', allOnlineUsers);
        }
      });
    }); //end listening set-user event

    socket.on('inform-server', data => {
      console.log(data);
      data.isReminder = false;
      myIo.emit(data.userId, data);
    }); //end listening inform-server event

   
    //cron job to check for the start of meeting and send an alert to the user if he is online 1 min before the meeting begins
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
              let userId = result[0].userId;
              let purpose = result[0].purpose;
              let data = {
                isReminder: true,
                message: `Your meeting on ${purpose} is going to start within 1 minute`,
                userId: userId
              };
              socket.emit(userId, data);
              console.log('global event userId and data is emitted');
            }
          }
        });
    }); //end cron job to send an alert notification if the user is online

    socket.on('disconnect', () => {
      //disconect the user from the socket
      //remove the user from online list
      //unsubscribe the user from this own channel
      console.log('user is disconnected ' + socket.userId);
      console.log(socket.userId);

      let removeIndex = allOnlineUsers
        .map(user => {
          return user.userId;
        })
        .indexOf(socket.userId);
      //console.log(removeIndex);
      allOnlineUsers.splice(removeIndex, 1);
      console.log('delete allOnlineUsers', allOnlineUsers);
      io.emit('online-user-list', allOnlineUsers);

      //leave the room
      socket.leave(socket.room);
    }); //end disconnect event
  });
};

module.exports = {
  setServer: setServer
};
