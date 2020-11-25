const express = require('express');
const meetingController = require("./../controllers/meetingController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const admin = require('./../middlewares/isAdmin');

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/meetings`;

    app.post(`${baseUrl}/addMeeting`, admin.isAdmin, meetingController.addMeeting);
    /**
     * @api {post} /api/v1/meetings/addMeeting Api for scheduling a meeting.
     * @apiVersion  0.1.0
     * @apiGroup Meeting
     * @apiName Schedule-The-Meeting
     * 
     * 
     * @apiParam {string} authToken Token for Authentication. (Send authToken as body parameter or as a header) (required)
     * @apiParam {string} meetingName Meeting name/title for the Meeting. (body params) (required)
     * @apiParam {string} meetingDescription Short Description of the Meeting. (body params) (required)
     * @apiParam {string} organizerId AdminId of the organizer who is Schedling the Meeting. (body params) (required)
     * @apiParam {string} organizerName Name of the Organizer who is Schedling Meeting. (body params) (required)
     * @apiParam {string} participantId User-Id of the participant who is invited for the Meeting. (body params) (required)
     * @apiParam {string} meetingStartDateAndTime Start date & time of the Meeting. (body params) (required)
     * @apiParam {string} meetingEndDateAndTime End date & time of the Meeting. (body params) (required) 
     * @apiParam {number} meetingLocation Location/Address of the Meeting. (body params) (required)
     *
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * @apiSuccessExample {object} Success-Response:
     * {
        "error": false,
        "message": "Meeeting Scheduled Successfully",
        "status": 200,
        "data": {
            "meetingId": "0bzRrzXDP",
            "meetingName": "Team Selection",
            "meetingDescription": "Need to discuss a few thngs about next year IPL team selection",
            "organizerId": "FqcbjLr3G",
            "organizerName": "Ravi",
            "participantId": "tkrdHTxwb",
            "participantName": "Ms Dhoni",
            "participantEmail": "dhoni@gmail.com",
            "meetingStartDateAndTime": "2020-11-22T12:30:00.000Z",
            "meetingEndDateAndTime": "2020-11-22T14:30:00.000Z",
            "meetingLocation": "Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates"
          }
        }
     * 
     * @apiErrorExample {json} Error-Response:
     * {
        "error": true,
        "message": "Failed to create new meeting",
        "status": 500,
        "data": null
        }
     * 
     *
     */


    app.get(`${baseUrl}/viewAllMeetings/:participantId/query`, auth.isAuthorized, meetingController.getAllMeetingsByParticipantId)
    /**
     * @api {get} /api/v1/meetings/viewAllMeetings/:participantId/query API to Get All Meetings details of a particular participant/user
     * @apiVersion 0.1.0
     * @apiGroup Meeting
     * @apiName Get-All-Meetings-Of-Participant
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter) (required)
     * @apiParam {String} participantId The participantId to find particular User.(Send participantId as a route parameter) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * @apiSuccessExample {object} Success-Response:
     * 
     * {
        "error": false,
        "message": "Meeting Details Found",
        "status": 200,
        "data": [
            {
                "meetingId": "0bzRrzXDP",
                "meetingName": "Team Selection",
                "meetingDescription": "Need to discuss a few thngs about next year IPL team selection",
                "organizerId": "FqcbjLr3G",
                "organizerName": "Ravi",
                "participantId": "tkrdHTxwb",
                "participantName": "Ms Dhoni",
                "participantEmail": "dhoni@gmail.com",
                "meetingStartDateAndTime": "2020-11-22T12:30:00.000Z",
                "meetingEndDateAndTime": "2020-11-22T14:30:00.000Z",
                "meetingLocation": "Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates",
                "_id": "5fba7ede84ffa014681d4b62",
                "__v": 0
            },
            {
                "meetingId": "0bzRrzXDz",
                "meetingName": "Employee Hire",
                "meetingDescription": "Interviewing an candidate for MEAN stack developer role",
                "organizerId": "FqcbjLr6G",
                "organizerName": "Ravi",
                "participantId": "tkrdHTxwb",
                "participantName": "Ms Dhoni",
                "participantEmail": "dhoni@gmail.com",
                "meetingStartDateAndTime": "2020-11-22T12:30:00.000Z",
                "meetingEndDateAndTime": "2020-11-22T14:30:00.000Z",
                "meetingLocation": "Interview Cabin, Tech Park, White-Field, Bangalore",
                "_id": "5fba7ede84ffa014681d4b62",
                "__v": 0
            }
          ]
      }
     * 
     * @apiErrorExample {json} Error-Response:
     * {
        "error": true,
        "message": "Failed To Find Meeting Details",
        "status": 500,
        "data": null    
      }
     * 
     * 
     * */



    app.get(`${baseUrl}/getMeetingById/:meetingId/query`, admin.isAdmin, meetingController.getMeetingById)
    /**
     * @api {get} /api/v1/meetings/getMeetingById/:meetingId/query API to Get One Meeting detail.
     * @apiVersion 0.1.0
     * @apiGroup Meeting
     * @apiName Get-Single-Meetings-Of-Participant
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter) (required)
     * @apiParam {String} meetingId The meetingId to find particular meeting details.(Send meetingId as a route parameter) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * @apiSuccessExample {object} Success-Response:
     * {
        "error": false,
        "message": "Meeting details by provided meetingId found",
        "status": 200,
        "data": {
            "meetingId": "0bzRrzXDP",
            "meetingName": "Team Selection",
            "meetingDescription": "Need to discuss a few thngs about next year IPL team selection",
            "organizerId": "FqcbjLr3G",
            "organizerName": "Ravi",
            "participantId": "tkrdHTxwb",
            "participantName": "Ms Dhoni",
            "participantEmail": "dhoni@gmail.com",
            "meetingStartDateAndTime": "2020-11-22T12:30:00.000Z",
            "meetingEndDateAndTime": "2020-11-22T14:30:00.000Z",
            "meetingLocation": "Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates"
         }
        }
     * @apiErrorExample {json} Error-Response:
     * {
        "error": true,
        "message": "failed to find the Meeting details",
        "status": 500,
        "data": null
       }
     * 
     * */


    app.put(`${baseUrl}/editMeeting/:meetingId/query`, admin.isAdmin, meetingController.editMeeting)
    /**
     * @api {put} /api/v1/meetings/editMeeting/:meetingId/query API to Edit a Meeting
     * @apiVersion 0.1.0
     * @apiGroup Meeting
     * @apiName Meeting-Edit
     *
     * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter) (required)
     * @apiParam {String} meetingId MeetingId of the Meeting. (Send meetingId as a route parameter) (required)
     * 
     * @apiParam {string} meetingName Meeting name/title for the Meeting. (body params) 
     * @apiParam {string} meetingDescription Short Description of the Meeting. (body params) 
     * @apiParam {string} organizerId AdminId of the organizer who is Schedling the Meeting. (body params) 
     * @apiParam {string} organizerName Name of the Organizer who is Schedling Meeting. (body params) 
     * @apiParam {string} participantId User-Id of the participant who is invited for the Meeting. (body params) 
     * @apiParam {string} meetingStartDateAndTime Start date & time of the Meeting. (body params) 
     * @apiParam {string} meetingEndDateAndTime End date & time of the Meeting. (body params)  
     * @apiParam {number} meetingLocation Location/Address of the Meeting. (body params) 
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     * @apiSuccessExample {json} Success-Response:
     * {
        "error": false,
        "message": "Meeting Edited Successfully.",
        "status": 200,
        "data": {
            "meetingId": "0bzRrzXDP",
            "meetingName": "Team Selection",
            "meetingDescription": "Need to discuss a few thngs about next year IPL team selection",
            "organizerId": "FqcbjLr3G",
            "organizerName": "Ravi",
            "participantId": "tkrdHTxwb",
            "participantName": "Ms Dhoni",
            "participantEmail": "dhoni@gmail.com",
            "meetingStartDateAndTime": "2020-11-22T12:30:00.000Z",
            "meetingEndDateAndTime": "2020-11-22T14:30:00.000Z",
            "meetingLocation": "Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates",
            "_id": "5fba7ede84ffa014681d4b62",
            "__v": 0
        }
    }
     * 
     * @apiErrorExample {json} Error-Response:
     * {
        "error": true,
        "message": "Failed to Edit Meeting",
        "status": 500,
        "data": null
      }
     * 
     * 
     * */


    app.post(`${baseUrl}/deleteMeeting/:meetingId`, admin.isAdmin, meetingController.deleteMeeting)
    /**
     * @api {post} /api/v1/meetings/deleteMeeting/:meetingId Api to cancel the Meeting.
     * @apiVersion 0.1.0
     * @apiGroup Meeting
     * @apiName Cancel-The-Meeting
     * @apiParam {String} authToken Token for Authentication.(Send authToken as body parameter or as a header) (required)
     * @apiParam {String} meetingId The Meeting-Id to delete the Meeting details.(Send meetingId as route parameter) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * @apiSuccessExample {object} Success-Response:
     * 
     * {
        "error": false,
        "message": "Meeting Deleted Successfully",
        "status": 200,
        "data": {
            "meetingId": "0vNR8uZGl",
            "meetingName": "Team Selection",
            "meetingDescription": "Need to discuss a few thngs about next year IPL team selection",
            "organizerId": "qcbjLr3G",
            "organizerName": "Ravi",
            "participantId": "tkrdHTxwb",
            "participantName": "Ms Dhoni",
            "participantEmail": "dhoni@gmail.com",
            "meetingStartDateAndTime": "2020-11-22T12:30:00.000Z",
            "meetingEndDateAndTime": "2020-11-22T14:30:00.000Z",
            "meetingLocation": "Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates",
            "_id": "5fba801f84ffa014681d4b63",
            "__v": 0
        }
      }
     * 
     * @apiErrorExample {json} Error-Response:
     * {
        "error": true,
        "message": "Failed To delete the Meeting",
        "status": 500,
        "data": null
        }
     * 
     * 
     * 
     */


}