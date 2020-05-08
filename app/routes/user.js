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
  /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/signup api for user login.
     *
     * @apiParam {string} firstName firstName user. (body params) (required)
     * @apiParam {string} lastName lastName of user. (body params) 
     * @apiParam {string} password password of user. (body params) (required)
     * @apiParam {string} email email of user. (body params) (required)
     * @apiParam {string} mobileNumber mobileNumber of user. (body params)
     * @apiParam {string} userRole userRole of user. (body params) (required)
     * @apiParam {string} userName userName of user. (body params) (required)
     * @apiParam {string} countryCode countryCode of user. (body params) (required)
     * @apiParam {string} countryName countryName of user. (body params) (required)
     * @apiParam {string} internationalCode internationalCode of user. (body params) 
     * @apiParam {string} avatar profile image url of user. (body params) 
     * 
     * 
     * 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * {
    "error": false,
    "message": "User  created",
    "status": 200,
    "data": {
        "userId": "Bg-2kX-yN",
        "firstName": "Rohit",
        "lastName": "Talekar",
        "email": "talekarrohit@gmail.com",
        "mobileNumber": 8660313649,
        "userRole": "normal",
        "userName": "rohit",
        "countryCode": "IN",
        "countryName": "India",
        "internationalCode": "91",
        "createdOn": "2020-05-08T17:03:26.000Z",
        "avatar": "https://project-images-upload.s3.amazonaws.com/default-avatar.jpg",
        "_id": "5eb590de07f3650a3c4e6b42",
        "__v": 0
    }
}
        
*/
  app.post(`${baseUrl}/signup`, userController.signUpFunction);

  /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email/username of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
          "error": false,
          "message": "Login successful",
          "status": 200,
          "data": {
          "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6InYteUVuT3ZHQiIsImlhdCI6MTU4ODk1NTQ3NzI0NSwiZXhwIjoxNTg5MDQxODc3LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJ2YWliaGF2IiwiZGF0YSI6eyJ1c2VySWQiOiJzOFZUNHFvcHMiLCJmaXJzdE5hbWUiOiJWYWliaGF2IiwibGFzdE5hbWUiOiJOYWlrIiwiZW1haWwiOiJuYWlrdmFpYmhhdjE5OTRAcmVkaWZmbWFpbC5jb20iLCJtb2JpbGVOdW1iZXIiOjk0ODI3ODU3MjAsInVzZXJSb2xlIjoiYWRtaW4iLCJ1c2VyTmFtZSI6InZhaWJoYXYtYWRtaW4iLCJjb3VudHJ5Q29kZSI6IklOIiwiY291bnRyeU5hbWUiOiJJbmRpYSIsImludGVybmF0aW9uYWxDb2RlIjoiOTEiLCJhdmF0YXIiOiJodHRwczovL3Byb2plY3QtaW1hZ2VzLXVwbG9hZC5zMy5hbWF6b25hd3MuY29tL2RlZmF1bHQtYXZhdGFyLmpwZyIsIl9pZCI6IjVlYjU3ZjAyMDdmMzY1MGEzYzRlNmIzYyJ9fQ._et4CkMeBkwDvJPJ1FiG-srbI_lEqSA6QKc-IYmKi-I",
          "userDetails": {
            "userId": "s8VT4qops",
            "firstName": "Vaibhav",
            "lastName": "Naik",
            "email": "naikvaibhav1994@rediffmail.com",
            "mobileNumber": 9482785720,
            "userRole": "admin",
            "userName": "vaibhav-admin",
            "countryCode": "IN",
            "countryName": "India",
            "internationalCode": "91",
            "avatar": "https://project-images-upload.s3.amazonaws.com/default-avatar.jpg",
            "_id": "5eb57f0207f3650a3c4e6b3c"
         }
        }
*/
 app.post(`${baseUrl}/login`, userController.loginFunction);



 /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users api to fetch all the normal users in the DB.
     *
     * @apiParam {string} authToken authToken of logged in user. (header params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
      {
        "error": false,
        "message": "All the users present in the DB",
        "status": 200,
        "data": [
          {
            "_id": "5eb57f3907f3650a3c4e6b3d",
            "userId": "eTD0sBos7",
            "firstName": "Vinayak",
            "lastName": "Naik",
            "email": "vinayaknaik1962@gmail.com",
            "mobileNumber": 9480495586,
            "userRole": "normal",
            "userName": "vinayak",
            "countryCode": "IN",
            "countryName": "India",
            "internationalCode": "91",
            "createdOn": "2020-05-08T15:48:09.000Z",
            "avatar": "https://project-images-upload.s3.amazonaws.com/default-avatar.jpg"
          }
        ]
      }
*/
  app.get(`${baseUrl}`, auth.isAuthorized, userController.getAllUsers);


  /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users/:userId api to fetch all the normal users in the DB.
     *
     * @apiParam {string} userId userId of user. (route params) (required)
     * @apiParam {string} authToken authToken of logged in user. (header params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
      {
        "error": false,
        "message": "All the users present in the DB",
        "status": 200,
        "data": [
          {
            "_id": "5eb57f3907f3650a3c4e6b3d",
            "userId": "eTD0sBos7",
            "firstName": "Vinayak",
            "lastName": "Naik",
            "email": "vinayaknaik1962@gmail.com",
            "mobileNumber": 9480495586,
            "userRole": "normal",
            "userName": "vinayak",
            "countryCode": "IN",
            "countryName": "India",
            "internationalCode": "91",
            "createdOn": "2020-05-08T15:48:09.000Z",
            "avatar": "https://project-images-upload.s3.amazonaws.com/default-avatar.jpg"
          }
        ]
      }
*/
app.get(
  `${baseUrl}/:userid`,
  auth.isAuthorized,
  userController.getSingleUser
);




  
  app.post(`${baseUrl}/logout`, userController.logout);


   
 /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/forgotPassword find user to whom the reset link should be sent over the email.
     *
     * @apiParam {string} email email/username of the user. (body params) (required)
    
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * {
         "error": false,
         "message": "Mail has been sent",
          "status": 200,
         "data": null
        }
        
*/
  app.post(`${baseUrl}/forgotPassword`, userController.forgotPassword);

  app.get(`${baseUrl}/resetPassword/:id/:token`, userController.resetPassword);

  app.post(`${baseUrl}/updatePassword`, userController.updatePassword);
  

   /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/upload upload users profile photo to AWS S3.
     * @apiParam {string} file contents. (file params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * { image: req.file }
        
*/
  app.post(
    `${baseUrl}/upload`,
    upload.array('image', 1),
    userController.uploadImage
  );
};
