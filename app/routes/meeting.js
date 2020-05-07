const express = require('express');
const router = express.Router();
const meetingController = require('./../controllers/meetingController');
const appConfig = require('./../../config/appConfig');

//middleware
const auth = require('./../middlewares/auth');

module.exports.setRouter = app => {
  let baseUrl = `${appConfig.apiVersion}/meetings`;

  // defining routes.

  app.post(
    `${baseUrl}/create/:userId`,
    auth.isAuthorized,
    meetingController.createMeetingFunction
  );

  app.get(
    `${baseUrl}/user/:userId`,
    auth.isAuthorized,
    meetingController.getAllMeetingFunction
  );

  app.get(
    `${baseUrl}/meeting/:meetid`,
    auth.isAuthorized,
    meetingController.getAMeetingDetail
  );

  app.post(
    `${baseUrl}/user/:userId/meeting/:meetid`,
    auth.isAuthorized,
    meetingController.deleteMeeting
  );

  app.put(
    `${baseUrl}/user/:userId/meeting/:meetid`,
    auth.isAuthorized,
    meetingController.editMeeting
  );
};
