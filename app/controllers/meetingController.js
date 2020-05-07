const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidation');
const check = require('../libs/checkLib');
const tokenLib = require('./../libs/tokenLib');
const email = require('./../libs/emailLib');
const socketLib = require('./../libs/socketLib');


/* Models */
const UserModel = mongoose.model('User');
const MeetingModel = mongoose.model('Meeting');

// start createMeeting function

let createMeeting = (req, res) => {
  const colors = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    }
  };

  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.body.purpose)) {
        let apiResponse = response.generate(
          true,
          'Purpose is missing',
          400,
          null
        );
        reject(apiResponse);
      } else if (check.isEmpty(req.body.location)) {
        let apiResponse = response.generate(
          true,
          'Location is missing',
          400,
          null
        );
        reject(apiResponse);
      } else if (check.isEmpty(req.body.startDate)) {
        let apiResponse = response.generate(
          true,
          'StartDate is missing',
          400,
          null
        );
        reject(apiResponse);
      } else if (check.isEmpty(req.body.endDate)) {
        let apiResponse = response.generate(
          true,
          'StartDate is missing',
          400,
          null
        );
        reject(apiResponse);
      } else if (req.body.endDate < req.body.startDate) {
        let apiResponse = response.generate(
          true,
          'Start Date should not be greater than End date',
          400,
          null
        );
        reject(apiResponse);
      } else {
        resolve(req);
      }
    });
  }; //end validUserInput

  let checkForOverlappingMeetings = () => {
    return new Promise((resolve, reject) => {
      MeetingModel.find({
        userId: req.params.userId,
        startDate: { $lt: req.body.endDate },
        endDate: { $gt: req.body.startDate }
      }).exec((err, result) => {
        if (err) {
          logger.error(
            err.message,
            'meetingController:checkForOverlappingMeetings',
            1
          );
          let apiResponse = response.generate(
            true,
            'Error while checking if meetings overlap',
            500,
            null
          );
          reject(apiResponse);
        } else if (check.isEmpty(result)) {
          logger.info(
            'No meetings overlap',
            'meetingController:checkForOverlappingMeetings',
            5
          );
          resolve(result);
        } else {
          logger.info(
            'Meetings do overlap',
            'meetingController:checkForOverlappingMeetings',
            5
          );
          resolve(result);
        }
      });
    });
  }; //end checkForOverlappingMeetings

  let saveMeeting = overlappedMeetings => {
    return new Promise((resolve, reject) => {
      let newMeeting;
      //if meetings do overlap with the new meeting to be created then assign the color of the new meeting to be created with red
      if (overlappedMeetings.length > 0) {
        //checking if meetings do overlap or not
        newMeeting = new MeetingModel({
          meetingId: shortid.generate(),
          purpose: req.body.purpose,
          location: req.body.location,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          createdBy: req.body.createdBy,
          userDetails: req.body.userDetails,
          color: colors.red,
          userId: req.body.userId,
          createdOn: time.now()
        });
        //if meetings dont overlap with the new meeting to be created then assign the color of the new meeting to be created with yellow
      } else {
        newMeeting = new MeetingModel({
          meetingId: shortid.generate(),
          purpose: req.body.purpose,
          location: req.body.location,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          createdBy: req.body.createdBy,
          userDetails: req.body.userDetails,
          color: colors.yellow,
          userId: req.body.userId,
          createdOn: time.now()
        });
      }
      newMeeting.save((err, newMeeting) => {
        if (err) {
          console.log(err.message);
          logger.error(err.message, 'meetingController:saveMeeting', 10);
          let apiResponse = response.generate(
            true,
            'Failed to create a new meeting',
            500
          );
          reject(apiResponse);
        } else {
          newMeeting = newMeeting.toObject();
          logger.info(
            'A new meeting is created',
            'meetingController:saveMeeting',
            5
          );
          //get the information of the new meeting saved to send the email to the user
          UserModel.findOne({ userId: newMeeting.userId }).exec(
            (err, result) => {
              if (err) {
                logger.error(err.message, 'meetingController:saveMeeting', 1);
                let apiResponse = response.generate(
                  true,
                  'Error while fetching the meeting details before sending an email',
                  500,
                  null
                );
                reject(apiResponse);
              } else if (check.isEmpty(result)) {
                logger.info(
                  'No meeting found',
                  'meetingController:saveMeeting',
                  5
                );
                resolve(result);
              } else {
                // console.log('User found to home the email needs to be sent');
                email.emailOnMeetingCreation(
                  result.email,
                  result.firstName,
                  newMeeting.startDate,
                  newMeeting.purpose,
                  newMeeting.endDate,
                  newMeeting.location
                );
              }
            }
          );
          resolve(newMeeting);
        }
      });
    });
  }; //end saveMeeting

  validateUserInput(req, res)
    .then(checkForOverlappingMeetings)
    .then(saveMeeting)
    .then(resolve => {
      let apiResponse = response.generate(
        false,
        'A new meeting is created',
        201,
        resolve
      );
      res.send(apiResponse);
    })
    .catch(err => {
      console.log(err.message);
      res.send(err);
    });
}; // end createMeeting function

let getAllMeetingFunction = (req, res) => {
  MeetingModel.find({ userId: req.params.userId })
    .populate('createdBy', 'firstName')
    .exec((err, result) => {
      if (err) {
        logger.error(
          err.message,
          'meetingController:getAllMeetingFunction',
          10
        );
        let apiResponse = response.generate(
          true,
          'Failed to fetch meeting',
          500
        );
        res.send(apiResponse);
      } else if (check.isEmpty(result)) {
        logger.error(
          'MettingData details is empty',
          'meetingController:getAllMeetingFunction',
          5
        );
        let apiResponse = response.generate(
          true,
          'Not a single meeting created yet',
          204,
          ''
        );
        res.send(apiResponse);
      } else {
        logger.info(
          'MettingData fetched',
          'meetingController:getAllMeetingFunction',
          5
        );
        let apiResponse = response.generate(false, 'Data fetched', 200, result);
        res.send(apiResponse);
      }
    });
}; // end getAllMeetingFunction function

let getAMeetingDetail = (req, res) => {
  console.log(req.params.meetid);
  MeetingModel.findOne({ meetingId: req.params.meetid })
    .populate('createdBy', 'userName')
    .exec((err, result) => {
      if (err) {
        logger.error(err.message, 'meetingController:getAMeetingDetail', 10);
        let apiResponse = response.generate(
          true,
          'Failed to fetch meeting',
          500
        );
        res.send(apiResponse);
      } else if (check.isEmpty(result)) {
        logger.error(
          'MettingData details is empty',
          'meetingController:getAMeetingDetail',
          5
        );
        let apiResponse = response.generate(true, 'No data found', 204, '');
        res.send(apiResponse);
      } else {
        logger.info(
          'MettingData fetched',
          'meetingController:getAMeetingDetail',
          5
        );
        let apiResponse = response.generate(false, 'Data fetched', 200, result);
        res.send(apiResponse);
      }
    });
}; //end getAMeetingDetail function

let deleteMeeting = (req, res) => {
  const colors = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    }
  };

  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.params.meetid)) {
        let apiResponse = response.generate(
          true,
          'meetid is missing',
          400,
          null
        );
        reject(apiResponse);
      } else {
        MeetingModel.findOne({ meetingId: req.params.meetid }).exec(
          (err, meetingDetails) => {
            if (err) {
              logger.error(
                err.message,
                'meetingController:validateUserInput',
                10
              );
              let apiResponse = response.generate(
                true,
                'Failed to find meeting to be deleted',
                500
              );
              reject(apiResponse);
            } else if (check.isEmpty(meetingDetails)) {
              logger.error(
                'MettingData details is empty',
                'meetingController:validateUserInput',
                5
              );
              let apiResponse = response.generate(
                true,
                'No data found',
                204,
                ''
              );
              reject(apiResponse);
            } else {
              resolve(meetingDetails);
            }
          }
        );
      }
    });
  }; //end validateUserInput

  let getAnyAvailableMeeting = meetingDetails => {
    return new Promise((resolve, reject) => {
      MeetingModel.find({
        userId: req.params.userId,
        meetingId: { $ne: req.params.meetid },
        startDate: { $lt: meetingDetails.endDate },
        endDate: { $gt: meetingDetails.startDate }
      }).exec((err, overlappingMeetings) => {
        if (err) {
          logger.error(
            err.message,
            'meetingController:getAnyAvailableMeeting',
            10
          );
          let apiResponse = response.generate(
            true,
            'Failed to find any overlapping meetings',
            500
          );
          reject(apiResponse);
        } else if (check.isEmpty(overlappingMeetings)) {
          logger.error(
            'Overlapping meeting details is empty',
            'meetingController:getAnyAvailableMeeting',
            5
          );
          resolve(overlappingMeetings);
        } else {
          resolve(overlappingMeetings);
        }
      });
    });
  }; //end getAnyAvailableMeeting

  let updateAlreadyOverlappedMeeting = overlappedMeeting => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(overlappedMeeting)) {
        logger.info(
          'No meetings overlap with this meeting',
          'meetingController:updateAlreadyOverlappedMeeting',
          5
        );
        resolve();
      } else {
        overlappedMeeting.map(element => {
          MeetingModel.findOne({ meetingId: element.meetingId }).exec(
            //meetings that are related with the meeting that is selected for deletion
            (err, data) => {
              if (check.isEmpty(data)) {
                reject();
              } else {
                console.log('data', data);
                //check if the related meetings with the meeting to be deleted do have any overlapping meetings
                MeetingModel.find({
                  meetingId: { $ne: data.meetingId },
                  startDate: { $lt: data.endDate },
                  endDate: { $gt: data.startDate }
                }).exec((err, data2) => {
                  //color of the meeting is updated to yellow if the meeting now doesn't overlap
                  console.log('data2', data2);
                  if (data2) {
                    if (data2.length == 1) {
                      MeetingModel.updateOne(
                        { meetingId: data.meetingId },
                        { color: colors.yellow }
                      ).exec((err, result) => {
                        if (result) console.log('Meeting Updated with color');
                      });
                    }
                    resolve(data);
                  } else {
                    MeetingModel.updateOne(
                      { meetingId: data.meetingId },
                      { color: colors.yellow }
                    ).exec((err, result) => {
                      if (result) console.log('Meeting Updated with color');
                    });
                    resolve(data);
                  }
                });
              }
            }
          );
        });
      }
    });
  }; //end updateAlreadyOverlappedMeeting

  let deleteMeeting = data => {
    return new Promise((resolve, reject) => {
      MeetingModel.deleteOne({ meetingId: req.params.meetid }).exec(
        (err, deleted) => {
          if (deleted) resolve(deleted);
        }
      );
    });
  }; //end deleteMeeting
  validateUserInput(req, res)
    .then(getAnyAvailableMeeting)
    .then(updateAlreadyOverlappedMeeting)
    .then(deleteMeeting)
    .then(resolve => {
      console.log('resolve', resolve);
      let apiResponse = response.generate(
        false,
        'Meeting is deleted',
        200,
        resolve
      );
      res.send(apiResponse);
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
}; //end deleteMeeting function

let editMeeting = (req, res) => {
  const colors = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    }
  };

  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.params.meetid)) {
        let apiResponse = response.generate(
          true,
          'meetid is missing',
          400,
          null
        );
        reject(apiResponse);
      } else {
        resolve();
      }
    });
  }; //end validateUserInput

  let updateMeeting = () => {
    return new Promise((resolve, reject) => {
      let options = req.body;
      options['color'] = colors.yellow;
      MeetingModel.updateOne({ meetingId: req.params.meetid }, options, {
        multi: true
      }).exec((err, updatedMeeting) => {
        if (err) {
          logger.error(err.message, 'meetingController:updateMeeting', 10);
          let apiResponse = response.generate(
            true,
            'Failed to update meeting',
            500
          );
          reject(apiResponse);
        } else {
          resolve(updatedMeeting);
        }
      });
    });
  }; //end updateMeeting

  let getDetailsOfUpdatedMeeting = () => {
    return new Promise((resolve, reject) => {
      MeetingModel.findOne({ meetingId: req.params.meetid })
        .populate('userDetails', 'email firstName')
        .exec((err, meetingUpdatedFound) => {
          if (err) {
            logger.error(
              err.message,
              'meetingController:getDetailsOfUpdatedMeeting',
              10
            );
            let apiResponse = response.generate(
              true,
              'Failed to get details of updated meeting',
              500
            );
            reject(apiResponse);
          } else {
            email.emailOnEditingMeeting(
              meetingUpdatedFound.userDetails.email,
              meetingUpdatedFound.userDetails.firstName,
              meetingUpdatedFound.startDate,
              meetingUpdatedFound.purpose,
              meetingUpdatedFound.endDate,
              meetingUpdatedFound.location
            );
            resolve(meetingUpdatedFound);
          }
        });
    });
  }; //end getDetailsOfUpdatedMeeting

  let checkForOverlappingMeetings = meetingUpdatedFound => {
    return new Promise((resolve, reject) => {
      MeetingModel.find({
        meetingId: { $ne: meetingUpdatedFound.meetingId },
        startDate: { $lt: meetingUpdatedFound.endDate },
        endDate: { $gt: meetingUpdatedFound.startDate }
      }).exec((err, overlapped) => {
        if (err) {
          logger.error(
            err.message,
            'meetingController:checkForOverlappingMeetings',
            10
          );
          let apiResponse = response.generate(
            true,
            'Unable to check for overlapped meetings',
            500
          );
          reject(apiResponse);
        } else {
          resolve(overlapped);
        }
      });
    });
  }; //end checkForOverlappingMeetings

  let updateColorOfOverlappedMeet = overlapped => {
    return new Promise((resolve, reject) => {
      if (!check.isEmpty(overlapped)) {
        overlapped.map(over => {
          MeetingModel.updateOne(
            { meetingId: over.meetingId },
            { color: colors.red },
            { multi: true }
          ).exec((err, updateColor) => {
            if (err) {
              logger.error(
                err.message,
                'meetingController:updateColorOfOverlappedMeet',
                10
              );
              let apiResponse = response.generate(
                true,
                'Unable to update color of overlapped meetings',
                500
              );
              reject(apiResponse);
            } else {
              resolve(updateColor);
            }
          });
        });
      } else {
        resolve();
      }
    });
  }; //end updateColorOfOverlappedMeet

  validateUserInput(req, res)
    .then(updateMeeting)
    .then(getDetailsOfUpdatedMeeting)
    .then(checkForOverlappingMeetings)
    .then(updateColorOfOverlappedMeet)
    .then(resolve => {
      console.log('resolve', resolve);
      let apiResponse = response.generate(
        false,
        'Meeting is edited',
        200,
        resolve
      );
      res.send(apiResponse);
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
}; //end editMeeting function

module.exports = {
  createMeetingFunction: createMeeting,
  getAllMeetingFunction: getAllMeetingFunction,
  getAMeetingDetail: getAMeetingDetail,
  deleteMeeting: deleteMeeting,
  editMeeting: editMeeting
}; // end exports
