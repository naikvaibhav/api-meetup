const mongoose = require("mongoose");
const shortid = require("shortid");
const time = require("./../libs/timeLib");
const response = require("./../libs/responseLib");
const logger = require("./../libs/loggerLib");
const validateInput = require("../libs/paramsValidation");
const check = require("../libs/checkLib");
const passwordLib = require("../libs/passwordLib");
const tokenLib = require("./../libs/tokenLib");
const email = require("./../libs/emailLib");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/* Models */
const UserModel = mongoose.model("User");
const AuthModel = mongoose.model("Auth");

// start user signup function

let signUpFunction = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        if (!validateInput.Email(req.body.email)) {
          let apiResponse = response.generate(
            true,
            "Email id does not meet the requirement",
            400,
            null
          );
          reject(apiResponse);
        } else if (check.isEmpty(req.body.password)) {
          let apiResponse = response.generate(
            true,
            "password parameter is missing",
            400,
            null
          );
          reject(apiResponse);
        } else {
          resolve(req);
        }
      } else {
        logger.error(
          "Field missing during user creation",
          "userController:validateUserInput",
          1
        );
        let apiResponse = response.generate(
          true,
          "One or More Parameter(s) is missing",
          null
        );
        reject(apiResponse);
      }
    });
  }; //end validUserInput

  let createUser = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({ email: req.body.email.toLowerCase() }).exec(
        (err, retrievedUserDetails) => {
          if (err) {
            logger.error(err.message, "userController:createUser", 10);
            let apiResponse = response.generate(
              true,
              "Failed to Create User",
              500,
              null
            );
            reject(apiResponse);
          } else if (check.isEmpty(retrievedUserDetails)) {
            console.log(req.body);
            if (req.body.avatar == "undefined") {
              req.body.avatar =
                "https://project-images-upload.s3.amazonaws.com/default-avatar.jpg";
            }
            let newUser = new UserModel({
              userId: shortid.generate(),
              firstName: req.body.firstName,
              lastName: req.body.lastName || "",
              password: passwordLib.hashPassword(req.body.password),
              email: req.body.email.toLowerCase(),
              mobileNumber: req.body.mobileNumber,
              userRole: req.body.userRole,
              userName: req.body.userName,
              countryCode: req.body.countryCode,
              countryName: req.body.countryName,
              internationalCode: req.body.internationalCode,
              avatar: req.body.avatar,
              createdOn: time.now(),
            });
            newUser.save((err, newUser) => {
              if (err) {
                logger.error(err.message, "userController:createUser", 10);
                let apiResponse = response.generate(
                  true,
                  "Failed to create a new user",
                  500
                );
                reject(apiResponse);
              } else {
                newUser = newUser.toObject();
                resolve(newUser);
              }
            });
          } else if (retrievedUserDetails.userName == req.body.userName) {
            logger.error(
              "User cannot be created. User already present",
              "userController:createUser",
              4
            );
            let apiResponse = response.generate(
              true,
              "User with this username already present",
              403,
              null
            );
            reject(apiResponse);
          } else {
            logger.error(
              "User cannot be created. User already present",
              "userController:createUser",
              4
            );
            let apiResponse = response.generate(
              true,
              "User with this email id already present",
              403,
              null
            );
            reject(apiResponse);
          }
        }
      );
    });
  }; //end createUser function

  validateUserInput(req, res)
    .then(createUser)
    .then((resolve) => {
      delete resolve.password;
      let apiResponse = response.generate(false, "User  created", 200, resolve);
      res.send(apiResponse);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
}; // end user signup function

// start of login function
let loginFunction = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        if (!validateInput.Email(req.body.email)) {
          let apiResponse = response.generate(
            true,
            "Email id does not meet the requirement",
            400,
            null
          );
          reject(apiResponse);
        } else if (check.isEmpty(req.body.password)) {
          let apiResponse = response.generate(
            true,
            "password parameter is missing",
            400,
            null
          );
          reject(apiResponse);
        } else {
          resolve(req);
        }
      } else {
        logger.error(
          "Field missing during user login",
          "userController:validateUserInput",
          1
        );
        let apiResponse = response.generate(
          true,
          "One or More Parameter(s) is missing",
          null
        );
        reject(apiResponse);
      }
    });
  }; //end validUserInput function

  let findUser = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({ email: req.body.email }).exec(
        (err, retrievedUserDetails) => {
          if (err) {
            logger.error(err.message, "userController:findUser()", 10);
            let apiResponse = response.generate(
              true,
              "Failed to Find User",
              500,
              null
            );
            reject(apiResponse);
          } else if (check.isEmpty(retrievedUserDetails)) {
            logger.error("No user found", "userController:findUser()", 7);
            let apiResponse = response.generate(
              true,
              "Unregistered email address",
              400,
              null
            );
            reject(apiResponse);
          } else {
            logger.info("User Found", "userController:findUser()", 10);
            resolve(retrievedUserDetails);
          }
        }
      );
    });
  }; //end findUser function

  let comparePassword = (retrievedUserDetails) => {
    return new Promise((resolve, reject) => {
      passwordLib.comparePassword(
        req.body.password,
        retrievedUserDetails.password,
        (err, isMatch) => {
          if (err) {
            logger.error(err.message, "userController:comparePassword", 10);
            let apiResponse = response.generate(
              true,
              "Login Failed",
              500,
              null
            );
            reject(apiResponse);
          } else if (isMatch) {
            retrievedUserDetails = retrievedUserDetails.toObject();
            delete retrievedUserDetails.password;
            delete retrievedUserDetails.createdOn;
            // delete retrievedUserDetails._id;
            delete retrievedUserDetails.__v;
            resolve(retrievedUserDetails);
          } else {
            logger.info(
              "Login Failed due to invalid password",
              "userController: comparePassword",
              10
            );
            let apiResponse = response.generate(
              true,
              "Wrong password, Login failed",
              400,
              null
            );
            reject(apiResponse);
          }
        }
      );
    });
  }; //end comparePassword function

  let generateToken = (userDetails) => {
    return new Promise((resolve, reject) => {
      tokenLib.generateToken(userDetails, (err, tokenDetails) => {
        if (err) {
          logger.error(err.message, "userController:generateToken", 10);
          let apiResponse = response.generate(
            true,
            "Failed to generate the token",
            500,
            null
          );
          reject(apiResponse);
        } else {
          (tokenDetails.userId = userDetails.userId),
            (tokenDetails.userDetails = userDetails);
          resolve(tokenDetails);
        }
      });
    });
  }; //end generateToken function

  let saveToken = (tokenDetails) => {
    return new Promise((resolve, reject) => {
      AuthModel.findOne(
        { userId: tokenDetails.userId },
        (err, retrievedTokenDetails) => {
          if (err) {
            logger.error(err.message, "userControler:saveToken()", 10);
            let apiResponse = response.generate(
              true,
              "Failed to generate token",
              500,
              null
            );
            reject(apiResponse);
          } else if (check.isEmpty(retrievedTokenDetails)) {
            let newAuthToken = new AuthModel({
              userId: tokenDetails.userId,
              authToken: tokenDetails.token,
              tokenSecret: tokenDetails.tokenSecret,
              tokenGenerationTime: time.now(),
            });
            newAuthToken.save((err, newTokenDetails) => {
              if (err) {
                logger.error(err.message, "userController:saveToken", 10);
                let apiResponse = response.generate(
                  true,
                  "err.message",
                  500,
                  null
                );
                reject(apiResponse);
              } else {
                let responseBody = {
                  authToken: newTokenDetails.authToken,
                  userDetails: tokenDetails.userDetails,
                };
                resolve(responseBody);
              }
            });
          } else {
            (retrievedTokenDetails.authToken = tokenDetails.token),
              (retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret),
              (retrievedTokenDetails.tokenGenerationTime = time.now());
            retrievedTokenDetails.save((err, newTokenDetails) => {
              if (err) {
                logger.error(err.message, "userController:saveToken", 10);
                let apiResponse = response.generate(
                  true,
                  "Failed to generate token",
                  500,
                  null
                );
                reject(apiResponse);
              } else {
                let responseBody = {
                  authToken: newTokenDetails.authToken,
                  userDetails: tokenDetails.userDetails,
                };
                resolve(responseBody);
              }
            });
          }
        }
      );
    });
  }; // end saveToken function

  validateUserInput(req, res)
    .then(findUser)
    .then(comparePassword)
    .then(generateToken)
    .then(saveToken)
    .then((resolve) => {
      let apiResponse = response.generate(
        false,
        "Login successful",
        200,
        resolve
      );
      console.log("result of login", resolve);
      res.send(apiResponse);
    })
    .catch((err) => {
      console.log("errhandler");
      console.log(err);
      res.status(err.status);
      res.send(err);
    });
}; // end of the login function

let getSingleUser = (req, res) => {
  UserModel.findOne({ userId: req.params.userid }).exec((err, user) => {
    if (err) {
      console.log("user not found");
    } else {
      const apiResponse = response.generate(
        false,
        "User details found",
        200,
        user
      );
      res.send(apiResponse);
    }
  });
}; //end getSingleUser function

let getAllUsers = (req, res) => {
  UserModel.find({ userRole: "normal" })
    .select("-password  -__v")
    .lean()
    .exec((err, usersFound) => {
      if (err) {
        logger.error(err.message, "userController:getAllUsers", 10);
        let apiResponse = response.generate(
          true,
          `error occured: ${err.message}`,
          500,
          null
        );
        res.send(apiResponse);
      } else if (check.isEmpty(usersFound)) {
        logger.error("No users found", "userController:getAllUSers", 10);
        let apiResponse = response.generate(
          true,
          "No users found in the database",
          404,
          null
        );
        res.send(apiResponse);
      } else {
        logger.info(
          "All the users present in the DB",
          "userController:getAllUsers",
          10
        );
        let apiResponse = response.generate(
          false,
          "All the users present in the DB",
          200,
          usersFound
        );
        res.send(apiResponse);
      }
    });
}; //end getAllUsers function

let logout = (req, res) => {
  console.log("logout called in userController", req.body);
  AuthModel.deleteOne({ userId: req.body.userId }, (err, result) => {
    if (err) {
      logger.error(err.message, "userController: logout", 10);
      let apiResponse = response.generate(
        true,
        `error ocuured: ${err.message}`,
        500,
        null
      );
      res.send(apiResponse);
    } else if (check.isEmpty(result)) {
      let apiResponse = response.generate(
        true,
        "Already logged out or invalid user",
        404,
        null
      );
      res.send(apiResponse);
    } else {
      console.log("resolve of logout", result);
      if (result.n == 1) {
        let apiResponse = response.generate(
          false,
          "Logged out successfully",
          200,
          result
        );
        res.send(apiResponse);
      } else {
        let apiResponse = response.generate(
          true,
          "Already logged out or invalid user",
          404,
          null
        );
        res.send(apiResponse);
      }
    }
  });
}; // end of the logout function.

let forgotPassword = (req, res) => {
  console.log("forgot password called");
  UserModel.findOne({ email: req.body.email }).exec((err, result) => {
    if (err) {
      logger.error(err.message, "userController:resetPassword()", 10);
      let apiResponse = response.generate(
        true,
        "Failed to Find User",
        500,
        null
      );
      res.send(apiResponse);
    } else if (check.isEmpty(result)) {
      logger.error("No user found", "userController:resetPassword()", 7);
      let apiResponse = response.generate(
        true,
        "No user with this email is registered",
        400,
        null
      );
      res.send(apiResponse);
    } else {
      logger.info("User Found", "userController:resetPassword()", 10);
      var payload = {
        userId: result.userId, // User ID from database
        email: result.email,
      };
      secret = result.password + "-" + result.createdOn.getTime();
      console.log(secret);
      const token = jwt.sign(payload, secret, { expiresIn: "30m" });
      let link = `http://meetup.angularweb.tech/resetPassword/${payload.userId}/${token}`;

      email.emailOnResetPassword(payload.email, link);
      let apiResponse = response.generate(
        false,
        "Mail has been sent",
        200,
        null
      );
      res.send(apiResponse);
    }
  });
}; //end of forgotPassword function

let resetPassword = (req, res) => {
  console.log("resetPassword", req.params);
  UserModel.findOne({ userId: req.params.id }).exec((err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("\n\n\nresult", result);
      secret = result.password + "-" + result.createdOn.getTime();
      console.log(secret);
      var payload = "";
      tokenLib.verifyClaim(req.params.token, secret, (err, decoded) => {
        if (err) {
          console.log(err);
          return res.send("Link expired");
        } else {
          return (payload = decoded);
        }
      });
      if (payload) {
        console.log(payload);
        let data = {
          userId: payload.userId,
          token: req.params.token,
        };
        let apiResponse = response.generate(
          false,
          "Token is verified",
          200,
          data
        );
        res.send(apiResponse);
      }
    }
  });
}; //end of resetPassword function

let updatePassword = (req, res) => {
  console.log("updatePassword", req.body);
  UserModel.findOne({ userId: req.body.userId }).exec((err, result) => {
    if (err) {
      logger.error(err.message, "userController:updatePassword()", 10);
      let apiResponse = response.generate(
        true,
        "Failed to Find User",
        500,
        null
      );
      res.send(apiResponse);
    } else if (check.isEmpty(result)) {
      logger.error("No user found", "userController:updatePassword()", 7);
      let apiResponse = response.generate(
        true,
        "No user with this id is registered",
        400,
        null
      );
      res.send(apiResponse);
    } else {
      console.log(result);
      let secret = result.password + "-" + result.createdOn.getTime();
      tokenLib.verifyClaim(req.body.token, secret, (err, decoded) => {
        if (err) {
          console.log(err);
          return res.send("Password Link expired");
        } else {
          console.log(decoded);
          if (decoded.userId == req.body.userId) {
            console.log("jwt verified");
            let password = passwordLib.hashPassword(req.body.password);
            console.log(password);
            // res.send('Your password has been successfully changed');
            UserModel.updateOne(
              { userId: req.body.userId },
              { password: password },
              {
                multi: true,
              }
            ).exec((err, result) => {
              if (err) {
                logger.error(
                  err.message,
                  "userController:updatePassword()",
                  10
                );
                let apiResponse = response.generate(
                  true,
                  "Failed to edit password",
                  500
                );
                res.send(apiResponse);
              } else {
                console.log(result);
                logger.info(
                  "Password updated",
                  "userController:updatePassword()",
                  10
                );
                let apiResponse = response.generate(
                  false,
                  "Your password has been successfully changed",
                  200,
                  null
                );
                res.send(apiResponse);
              }
            });
          } else {
            console.log("verification failed");
          }
        }
      });
    }
  });
}; //end of updatePassword function

let uploadImage = (req, res) => {
  console.log("image is uploaded");
  console.log(req.file);
  /* This will be the response sent from the backend to the frontend */
  res.send({ image: req.file });
}; //end of uploadImage function

module.exports = {
  signUpFunction: signUpFunction,
  loginFunction: loginFunction,
  getAllUsers: getAllUsers,
  logout: logout,
  getSingleUser: getSingleUser,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
  updatePassword: updatePassword,
  uploadImage: uploadImage,
}; // end exports
