const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const appConfig = require('./../../config/appConfig');
const upload = require('../middlewares/file-upload');

//middleware
const auth = require('../middlewares/auth');

module.exports.setRouter = app => {
  let baseUrl = `${appConfig.apiVersion}/users`;

  // defining routes.

  app.post(`${baseUrl}/signup`, userController.signUpFunction);

  app.post(`${baseUrl}/login`, userController.loginFunction);

  app.get(`${baseUrl}`, auth.isAuthorized, userController.getAllUsers);

  app.post(`${baseUrl}/logout`, userController.logout);

  app.get(
    `${baseUrl}/:userid`,
    auth.isAuthorized,
    userController.getSingleUser
  );

  app.post(`${baseUrl}/forgotPassword`, userController.forgotPassword);

  app.get(`${baseUrl}/resetPassword/:id/:token`, userController.resetPassword);

  app.post(`${baseUrl}/updatePassword`, userController.updatePassword);
  
  app.post(
    `${baseUrl}/upload`,
    upload.array('image', 1),
    userController.uploadImage
  );
};
