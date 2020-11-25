const express = require('express');
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const admin = require('./../middlewares/isAdmin')

module.exports.setRouter = (app) => {

	let baseUrl = `${appConfig.apiVersion}/users`;


	app.get(`${baseUrl}/view/all/query`, admin.isAdmin, userController.getAllUser);
	/**
	 * @api {get} /api/v1/users/view/all Get all users
	 * @apiVersion 0.1.0
	 * @apiGroup User
	 * @apiName getUser
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter)
	 *
	 * @apiSuccess {object} myResponse shows error status, message, http status code, result.
	 * 
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
		 "error": false,
		 "message": "All User Details Found",
		 "status": 200,
		 "data": [
				   {
				   "userId": "ic4Wn5pPT",
				   "firstName": "some-user",
				   "lastName": "one-lastname",
				   "email": "someone@mail.com",
				   "permissions": "user"
				 },
				 {
				   "userId": "gRvcZrjn_",
				   "firstName": "Suresh",
				   "lastName": "Raina",
				   "email": "suresh@gmail.com",
				   "permissions": "user"
				 }
			]
	   }
	 *  @apiErrorExample {json} Error-Response:
	 * {
		"error": true,
		"message": "Failed To Find all user details",
		"status": 500,
		"data": null
	   }
	 */

	// params: userId.
	app.get(`${baseUrl}/:userId/details/query`, auth.isAuthorized, userController.getSingleUser);
	/**
	 * @api {get} /api/v1/users/:userId/details Get single users
	 * @apiVersion 0.1.0
	 * @apiGroup User
	 * @apiName getSingleUser
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter)
	 * @apiParam {String} userId The userId to find particular User.(Send userId as  route parameter)
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 * {
		"error": false,
		"message": "User Details Found",
		"status": 200,
		"data": {
			"userId": "YZbEHperv",
			"firstName": "user3",
			"lastName": "user3 surname",
			"email": "user3@gmail.com",
			"permissions": "user"
		}
	   } 
	 * 
	 * @apiErrorExample {json} Error-Response:
	 * 
	 *
	 * {
		"error": true,
		"message": "Failed To Find User Details",
		"status": 500,
		"data": null
	   }
	 */


	app.post(`${baseUrl}/signup`, userController.signUpFunction);
	/**
	 * @api {post} /api/v1/users/signup api for user signup.
	 * @apiVersion  0.1.0
	 * @apiGroup User
	 * @apiName Signup
	 * 
	 * @apiParam {string} firstName firstName of the user. (body params) (required)
	 * @apiParam {string} lastName lastName of the user. (body params) (required)
	 * @apiParam {string} countryCode countryCode of the user. (body params) (required)
	 * @apiParam {number} mobileNumber mobileNumber of the user. (body params) (required)
	 * @apiParam {string} email email of the user. (body params) (required)
	 * @apiParam {string} password password of the user. (body params) (required)
	 *
	 * @apiSuccess {object} myResponse shows error status, message, http status code, result.
	 * 
	 * @apiSuccessExample {object} Success-Response:
		 {
			"error": false,
			"message": "User created",
			"status": 200,
			"data": {
				"userId": "zeBnrgaYI",
				"firstName": "user1",
				"lastName": "user1surname",
				"email": "user1@gmail.com",
				"permissions": "user"
			}
		}

	 *  @apiErrorExample {json} Error-Response:

	 * {
		"error": true,
		"message": "Failed to create new user",
		"status": 500,
		"data": null
	   }

	*/



	app.post(`${baseUrl}/login`, userController.loginFunction);
	/**
	 * @api {post} /api/v1/users/login api for user login.
	 * @apiGroup User
	 * @apiVersion  0.1.0
	 * @apiName Login
	 *
	 * @apiParam {string} email email of the user. (body params) (required)
	 * @apiParam {string} password password of the user. (body params) (required)
	 *
	 * @apiSuccess {object} myResponse shows error status, message, http status code, result.
	 * 
	 * @apiSuccessExample {object} Success-Response:
		{
			"error": false,
			"message": "Login Successful",
			"status": 200,
			"data": {
				"authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6ImNsNklCU2ZlNiIsImlhdCI6MTYwMTczMzY1MDYxOSwiZXhwIjoxNjAxODIwMDUwLCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJleHBlbnNlcyIsImRhdGEiOnsidXNlcklkIjoiemVCbnJnYVlJIiwiZmlyc3ROYW1lIjoidGVzdCIsImxhc3ROYW1lIjoidGxuYW1lIiwidmFsaWRhdGlvblRva2VuIjoiIiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsIm1vYmlsZU51bWJlciI6ODg5OTc3ODg5LCJjb3VudHJ5Q29kZSI6IjkxIn19.65NcSD5dVAmIuLN1KiRbsP8FFhMBMmSboWBV3ESY3Rs",
				"userDetails": {
				  "userId": "zeBnrgaYI",
				  "firstName": "test",
				  "lastName": "tlname",
				  "validationToken": "",
				  "email": "test@gmail.com",
				  "mobileNumber": 889977889,
				  "countryCode": "91",
				  "permissions": "user"
				}
			}
		}
	 *	@apiErrorExample {json} Error-Response:
	 * {
		"error": true,
		"message": "Wrong Passsword.Login Failed",
		"status": 400,
		"data": null
	   }
	*/


	app.put(`${baseUrl}/forgotpassword`, userController.forgotPassword)
	/**
	 * @api {put} /api/v1/users/forgotpassword reset/forgot the password
	 * @apiVersion 0.1.0
	 * @apiGroup User
	 * @apiName Reset-Password
	 *
	 * @apiParam {String} email email of the user. (body params) (required)
	 * 
	 * @apiSuccess {object} myResponse shows error status, message, http status code, result.
	 *
	 * @apiSuccessExample {json} Success-Response:
	 *  {
			"error": false,
			"message": "password reset link sent",
			"status": 200,
			"data": {
				"n": 1,
				"nModified": 1,
				"ok": 1
			}
		}
	
	 * @apiErrorExample {json} Error-Response:
	 
	 * {
		"error": true,
		"message": "Failed To reset user Password",
		"status": 500,
		"data": null
	   }
	 */



	app.post(`${baseUrl}/savepassword`, userController.savePassword)
	/**
	  * @api {post} /api/v1/users/savepassword save new password
	  * @apiVersion 0.1.0
	  * @apiGroup User
	  * @apiName Save-New-Password
	  *
	  * @apiParam {String} validationToken The token for authentication.(Send validationToken as body parameter)
	  * @apiParam {String} password The new password.(Send password as body parameter)
	  *
	  *  @apiSuccessExample {json} Success-Response:
	  *  {
		  "error": false,
		  "message": "Password Update Successfully",
		  "status": 200,
		  "data": {
			"n": 1,
			"nModified": 1,
			"ok": 1
		   }
		}
 	
	  * @apiErrorExample {json} Error-Response:
	  * {
		 "error": true,
		 "message": "Failed To reset user Password'",
		 "status": 500,
		 "data": null
		}
	  */





	app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);
	/**
	 * @api {post} /api/v1/users/logout user logout
	 * @apiVersion 0.1.0
	 * @apiGroup User
	 * @apiName Logout
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 *
	 * @apiSuccessExample {json} Success-Response:
	 *  {
		"error": false,
		"message": "User LogedOut successfully",
		"status": 200,
		"data": null
		    
		}
    
	 * @apiErrorExample {json} Error-Response:
	 * {
		"error": true,
		"message": "Failed To logout",
		"status": 500,
		"data": null
	   }
	 */


}
