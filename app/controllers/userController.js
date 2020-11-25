const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib')
const response = require('./../libs/responseLib')
const validateInput = require('./../libs/paramsValidationLib')
const check = require('./../libs/checkLib')
const logger = require('./../libs/loggerLib')
const passwordLib = require('./../libs/generatePasswordLib')
const token = require('../libs/tokenLib')

const UserModel = mongoose.model('User');
const AuthModel = mongoose.model('Auth');
const emailLib = require('../libs/emailLib');




let getAllUser = (req, res) => {
    UserModel.find()
        .select('-__v-_id') //fields to be hidden
        .lean()  //converting the mongoose object to the plain JS object
        .exec((err, result) => {
            if (err) {
                //console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                /*let finalRes = result.map((item) => {
                    if(item.permissions == 'user'){
                        delete item.mobileNumber
                        delete item.countryCode
                        delete item.createdOn
                        delete item._id
                        delete item.__v
                        delete item.password;
                        delete item.validationToken
                        return item
                    }
                })*/
                //console.log(finalRes)

                let finalRes = result.filter(per => per.permissions == 'user').map((item) => {
                    const { userId, firstName, lastName, email, permissions } = item;
                    return { userId, firstName, lastName, email, permissions }
                })
                let apiResponse = response.generate(false, 'All User Details Found', 200, finalRes)
                res.send(apiResponse)
            }
        })

}// end get all users

/* Get single user details */
let getSingleUser = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId }, (err, result) => {
        if (err) {
            //console.log(err)
            logger.error(err.message, 'User Controller: getSingleUser', 10)
            let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller:getSingleUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let finalRes = result.toObject()
            delete finalRes.password
            delete finalRes.validationToken
            delete finalRes.mobileNumber
            delete finalRes.countryCode
            delete finalRes._id
            delete finalRes.__v
            //console.log(finalRes)
            let apiResponse = response.generate(false, 'User Details Found', 200, finalRes)
            res.send(apiResponse)
        }
    })

}// end get single user

let signUpFunction = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    logger.error(err.message, 'User Controller:signUp-validateUserInput()', 10)
                    let apiResponse = response.generate(true, 'Email Does Not meet the requirement', 400, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(req.body.password)) {
                    logger.error(err.message, 'User Controller:signUp-validateUserInput()', 10)
                    let apiResponse = response.generate(true, '"Password" parameter is missing', 400, null);
                    reject(apiResponse);
                }
                else {
                    resolve(req);
                }
            }
            else {
                logger.error('Field Missing During User creation', 'userController : validateUserInput', 5)
                let apiResponse = response.generate(true, 'One or More Parameters is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email }, (err, retrievedUserDetails) => {
                if (err) {
                    logger.error(err.message, 'userController:signUp()-createUser()', 10)
                    let apiResponse = response.generate(true, 'failed to create User', 500, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(retrievedUserDetails)) {
                    //check whether the registration is for admin user or for normal user
                    if (check.isAdmin(req.body.lastName)) {
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            permissions: 'admin',
                            countryCode: req.body.countryCode
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController:signUp()-createUser-saving admin user details', 10)
                                let apiResponse = response.generate(true, 'Failed to create new user', 500, null)
                                reject(apiResponse)
                            }
                            else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    }
                    else {
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            permissions: 'user',
                            countryCode: req.body.countryCode
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController:signUp()-createUser-saving normal user details', 10)
                                let apiResponse = response.generate(true, 'Failed to create new user', 500, null)
                                reject(apiResponse)
                            }
                            else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    }
                }
                else {
                    logger.error('User Cannot Be created . User Already present', 'userController:createUser', 4)
                    let apiResponse = response.generate(true, 'User Already Present with this email', 403, null)
                    reject(apiResponse)
                }
            })
        })
    }//end create user function
    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            delete resolve.__v
            delete resolve.validationToken
            delete resolve.countryCode
            delete resolve.mobileNumber
            delete resolve._id
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err)
            res.status(err.status)
            res.send(err)
        })
}// end user signup function 


//start of login function
let loginFunction = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    if (err) {
                        logger.error('Failed to retrieve data', 'userController:loginFunction()-findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed to find user details', 500, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(userDetails)) {
                        logger.error('No  User Found', ' userController:loginFunction()-findUser()', 7)
                        let apiResponse = response.generate(true, 'No User details found in DB, kindly signup', 404, null)
                        reject(apiResponse)
                    }
                    else {
                        resolve(userDetails)
                    }
                })
            }
            else {
                let apiResponse = response.generate(true, 'Email Parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        return new Promise((resolve, reject) => {
            if (req.body.password) {
                passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                    if (err) {
                        logger.error(err.message, 'userController:loginFunction()-validatePassword()', 10)
                        let apiResponse = response.generate(true, 'Login Failed', 500, null)
                        reject(apiResponse)
                    }
                    else if (isMatch) {
                        let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                        delete retrievedUserDetailsObj.password
                        delete retrievedUserDetailsObj._id
                        delete retrievedUserDetailsObj.__v
                        resolve(retrievedUserDetailsObj)
                    }
                    else {
                        logger.info('Login Failed Due to Invalid Password', 'userController:loginFunction()-validatePassword()', 10)
                        let apiResponse = response.generate(true, 'Wrong Passsword.Login Failed', 400, null)
                        reject(apiResponse)
                    }
                })
            }
            else {
                let apiResponse = response.generate(true, 'Password field is missing', 400, null)
                reject(apiResponse)
            }

        })
    }
    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                    reject(apiResponse)
                }
                else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    logger.error(err.message, 'userController:loginFunction()-saveToken()', 10)
                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        permissions: tokenDetails.userDetails.permissions,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error(err.message, 'userController:loginFunction()-saveToken()', 10)
                            let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
                //if token details exists, then update those details
                else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.permissions = tokenDetails.userDetails.permissions
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController:loginFunction()-saveToken()', 10)
                            let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }


    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            //console.log(err)
            res.status(err.status)
            res.send(err)
        })
}


let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.user.userId }, (err, result) => {
        if (err) {
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.


let forgotPassword = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                UserModel.findOne({ email: req.body.email }, (err, retrievedUserDetails) => {
                    if (err) {
                        logger.error('Failed to retrieve data', 'userController:forgotPassword-findUser()', 10);
                        let apiResponse = response.generate(true, 'failed to find user details', 500, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(retrievedUserDetails)) {
                        logger.error('No User Found', 'userController:forgotPassword-findUser()-email is not registered', 7)
                        let apiResponse = response.generate(true, 'No user details found, kindly register', 404, null)
                        reject(apiResponse)
                    }
                    else {
                        logger.info('User Found', 'userController:findUser()', 10)
                        resolve(retrievedUserDetails)
                    }
                })
            }
            else {
                logger.error('Field Missing', 'userController :forgotPassword()-findUser()', 5)
                let apiResponse = response.generate(true, 'Email field is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let generateToken = (userDetails) => {
        //console.log('generating token...')
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    //console.log(err)
                    logger.error('Failed to generate token', 'userController:forgotPassword()-generateToken()', 10);
                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                    reject(apiResponse)
                }
                else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }


    let generateMail = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            let options = {
                validationToken: tokenDetails.token
            }
            UserModel.update({ 'email': req.body.email }, options).exec((err, result) => {
                if (err) {
                    //console.log(err)
                    logger.error(err.message, 'User Controller:generateMail', 10)
                    let apiResponse = response.generate(true, 'Failed To reset user Password', 500, null)
                    reject(apiResponse)
                } else {
                    //console.log(tokenDetails)
                    let sendEmailOptions = {
                        name: tokenDetails.userDetails.firstName,
                        email: tokenDetails.userDetails.email,
                        subject: 'Reset Password Request',
                        html: `Hello <strong> ${tokenDetails.userDetails.firstName}  </strong>,<br><br>You have requested to reset your password. Please find the below link<br><br><a href="www.shivashankarchillshetty.com/reset-password/${options.validationToken}">Reset password</a><br><br>Thank you<br>Shivashankar<br>CEO, TimeToMeet`
                        //html: `Hello <strong> ${tokenDetails.userDetails.firstName}  </strong>,<br><br>You have requested to reset your password. Please find the below link<br><br><a href="http://localhost:4200/reset-password/${options.validationToken}">Reset password</a><br><br>Thank you<br>Shivashankar<br>CEO, TimeToMeet`
                    }
                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 1000);

                    resolve(result)
                }
            })
        })
    }

    findUser(req, res)
        .then(generateToken)
        .then(generateMail)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'password reset link sent', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            res.status(err.status)
            res.send(err)
        })
}



let savePassword = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.validationToken) {
                UserModel.findOne({ validationToken: req.body.validationToken }, (err, userDetails) => {
                    if (err) {
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, 'validationToken parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }//end findUser()

    let passwordUpdate = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (req.body.password) {
                let options = {
                    password: passwordLib.hashpassword(req.body.password),
                    validationToken: ''
                }
                UserModel.update({ 'userId': userDetails.userId }, options).exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'User Controller:savePassword()-passwordUpdate', 10)
                        let apiResponse = response.generate(true, 'Failed To reset user Password', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found with given Details', 'User Controller:savePassword()- updatePassword')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        resolve(result)
                        let sendEmailOptions = {
                            email: userDetails.email,
                            subject: 'Password reset',
                            html: `Hello <strong>${userDetails.firstName}</strong>
                            <p>
                            Your password has been reset just now! for TimeToMeet Account, If its not you, then kindly reach out to us, Immediately!
                            </p>
                            <br><br>Thank you<br>Shivashankar<br>CEO, TimeToMeet  
                                        `
                        }

                        setTimeout(() => {
                            emailLib.sendEmail(sendEmailOptions);
                        }, 2000);
                    }
                });
            }
            else {
                let apiResponse = response.generate(true, 'password parameter is missing', 400, null)
                reject(apiResponse)
            }

        });
    }//end passwordUpdate

    findUser(req, res)
        .then(passwordUpdate)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password Update Successfully', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            //console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })


}// end savePassword





module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    getAllUser: getAllUser,
    getSingleUser: getSingleUser,
    logout: logout,
    forgotPassword: forgotPassword,
    savePassword: savePassword
}