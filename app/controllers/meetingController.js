const mongoose = require('mongoose');
const shortid = require('shortid');
const response = require('./../libs/responseLib')
const check = require('./../libs/checkLib')
const logger = require('./../libs/loggerLib')
const UserModel = mongoose.model('User');
const MeetingModel = mongoose.model('Meeting')
const emailLib = require('../libs/emailLib');



let getMeetingById = (req, res) => {
    if (req.params.meetingId) {
        MeetingModel.findOne({ 'meetingId': req.params.meetingId })
            .select('-_id -__v')
            .lean()
            .exec((err, meetingDetails) => {
                if (err) {
                    //console.log(err)
                    logger.error(err.message, 'Meeting Controller:getMeetingById', 500, null)
                    let apiResponse = response.generate(true, 'failed to find the Meeting details', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(meetingDetails)) {
                    logger.info('No Meeting Found', 'Meeting Controller:getMeetingById')
                    let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Meeting details by provided meetingId found', 200, meetingDetails)
                    res.send(apiResponse)
                }
            })
    }
    else {
        logger.error('Fields are missing', 'meetingController : getMeetingById', 5)
        let apiResponse = response.generate(true, 'Meeting id Parameters is missing', 400, null)
        res.send(apiResponse)
    }

}

let addMeeting = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.meetingName && req.body.meetingDescription && req.body.organizerId && req.body.organizerName && req.body.participantId && req.body.meetingStartDateAndTime && req.body.meetingEndDateAndTime && req.body.meetingLocation) {
                UserModel.findOne({ 'userId': req.body.participantId }, (err, participantDetails) => {
                    if (err) {
                        logger.error(err.message, 'Meeting Controller: addMeeting()-validateUserInput()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find Participant Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(participantDetails)) {
                        logger.info('No Participant Found', 'Meeting Controller:addMeeting()-validateUserInput()')
                        let apiResponse = response.generate(true, 'Failed To Schedule a Meeting', 404, null)
                        reject(apiResponse)
                    }
                    else {
                        resolve(participantDetails)
                    }
                })
            }
            else {
                logger.error('Field are Missing During Meeting Creation', 'meetingController: addMeeting()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) are missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let createMeeting = (participantDetails) => {
        return new Promise((resolve, reject) => {
            let newMeeting = new MeetingModel({
                meetingId: shortid.generate(),
                meetingName: req.body.meetingName,
                meetingDescription: req.body.meetingDescription,
                organizerId: req.body.organizerId,
                organizerName: req.body.organizerName,
                participantId: req.body.participantId,
                participantName: participantDetails.firstName + ' ' + participantDetails.lastName,
                participantEmail: participantDetails.email,
                meetingStartDateAndTime: req.body.meetingStartDateAndTime,
                meetingEndDateAndTime: req.body.meetingEndDateAndTime,
                meetingLocation: req.body.meetingLocation
            })
            newMeeting.save((err, newMeetingDetails) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'meetingController:addMeeting()-createMeeting-while saving', 10)
                    let apiResponse = response.generate(true, 'Failed to create new meeting', 500, null)
                    reject(apiResponse)
                }
                else {
                    let newMeetingObj = newMeetingDetails.toObject();
                    let sendEmailOptions = {
                        email: newMeetingObj.participantEmail,
                        subject: `Meeting Scheduled: ${newMeetingObj.meetingName}`,
                        html: `
                              Hi <b>${newMeetingObj.participantName}</b>,<br><br>
                              <div>
                                <b>${newMeetingObj.organizerName}</b> has scheduled a Meeting with you. Below are the Meeting Details.
                              </div> 
                              <div>
                                <h4>Meeting Name : ${newMeetingObj.meetingName}</h4>
                              </div>
                              <div>
                                <h4>Meeting Description : ${newMeetingObj.meetingDescription}</h4>
                              </div>
                              <div>
                                <h4>Meeting Organized By : ${newMeetingObj.organizerName}</h4>
                              </div>
                              <div>
                                <h4>Meeting Start At : ${newMeetingObj.meetingStartDateAndTime}</h4>
                              </div>
                              <div>
                                <h4>Meeting Ends At : ${newMeetingObj.meetingEndDateAndTime}</h4>
                              </div>
                              <div>
                                <h4>Meeting Place/Location : ${newMeetingObj.meetingLocation}</h4>
                              </div>
                              <p>Kindly login to your TimeToMeet application for more details.</p>
                                  <p><a href="www.shivashankarchillshetty.com">TimeToMeet</a></p>
                                  <br><br>Thank & Regards,<br>Shivashankar<br>CEO, TimeToMeet
                            `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);

                    resolve(newMeetingObj)
                }
            })
        })
    }
    validateUserInput(req, res)
        .then(createMeeting)
        .then((resolve) => {
            delete resolve._id
            delete resolve.__v
            let apiResponse = response.generate(false, 'Meeeting Scheduled Successfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err)
            res.status(err.status)
            res.send(err)
        })
}



let editMeeting = (req, res) => {
    if (req.params.meetingId) {
        let options = req.body
        //console.log(options)
        //updating the meeting & sending old data to the client(use {new:true} if you want to send updated data)
        MeetingModel.findOneAndUpdate({ 'meetingId': req.params.meetingId }, options).exec((err, result) => {
            if (err) {
                logger.error(err.message, 'Meeting Controller-editMeeting()', 10)
                let apiResponse = response.generate(true, 'Failed to Edit Meeting', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Meetings Found', 'Meeting Controller:editMeeting()')
                let apiResponse = response.generate(true, 'Meeting Not Found', 404, null)
                res.send(apiResponse)
            } else {
                let sendEmailOptions = {
                    email: result.participantEmail,
                    subject: `Meeting Updated: ${result.meetingName}`,
                    html: `
                    Hi <b>${result.participantName}</b>,<br><br>
                    <div>
                      <b>${result.organizerName}</b> has Updated the meeting :<b> ${result.meetingName}</b>.
                    </div> 
                    <p>Kindly login to your TimeToMeet application for more details.</p>
                    <p><a href="www.shivashankarchillshetty.com">TimeToMeet</a></p>
                    <br><br>Thank & Regards,<br>Shivashankar<br>CEO, TimeToMeet     
                        `
                }
                setTimeout(() => {
                    emailLib.sendEmail(sendEmailOptions);
                }, 2000);

                let apiResponse = response.generate(false, 'Meeting Edited Successfully.', 200, result)
                res.send(apiResponse)
            }
        })
    }
    else {
        logger.error('Meeting Id is missing', 'meetingController: editMeeting()', 5)
        let apiResponse = response.generate(true, 'MeetingId Parameter is missing', 400, null)
        res.send(apiResponse)
    }
}

let getAllMeetingsByParticipantId = (req, res) => {
    if (req.params.participantId) {
        MeetingModel.find({ 'participantId': req.params.participantId }, (err, meetingDetails) => {
            if (err) {
                //console.log(err)
                logger.error(err.message, 'Meeting Controller: getAllMeetingsByParticipantId()', 10)
                let apiResponse = response.generate(true, 'Failed To Find Meeting Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(meetingDetails)) {
                logger.info('No Meetings Found', 'Meeting Controller:getAllMeetingsByParticipantId()')
                let apiResponse = response.generate(true, 'No Meetings Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Meeting Details Found', 200, meetingDetails)
                res.send(apiResponse)
            }
        })
    }
    else {
        logger.error('Participant Id is missing', 'meetingController: getAllMeetingsByParticipantId()', 5)
        let apiResponse = response.generate(true, 'ParticipantId Parameter is missing', 400, null)
        res.send(apiResponse)
    }

}


let deleteMeeting = (req, res) => {
    MeetingModel.findOneAndRemove({ 'meetingId': req.params.meetingId }, (err, meetingDetails) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'Meeting Controller: deleteMeeting()', 10)
            let apiResponse = response.generate(true, 'Failed To delete the Meeting', 500, null)
            res.sent(apiResponse)
        } else if (check.isEmpty(meetingDetails)) {
            logger.info('No Meeting Found', 'Meeting Controller: deleteMeeting()')
            let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
            res.send(apiResponse)
        } else {
            console.log(meetingDetails)
            let sendEmailOptions = {
                email: meetingDetails.participantEmail,
                subject: `Meeting Cancelled: ${meetingDetails.meetingName}`,
                html: `
                Hi <b>${meetingDetails.participantName}</b>,<br><br>
                <div>
                  <b>${meetingDetails.organizerName}</b> has cancelled the meeting : <b>${meetingDetails.meetingName}</b>.
                </div> 
                <p>Kindly login to your TimeToMeet application for more details.</p>
                <p><a href="www.shivashankarchillshetty.com">TimeToMeet</a></p>
                <br><br>Thank & Regards,<br>Shivashankar<br>CEO, TimeToMeet     
                    `
            }
            setTimeout(() => {
                emailLib.sendEmail(sendEmailOptions);
            }, 2000);
            let apiResponse = response.generate(false, 'Meeting Deleted Successfully', 200, meetingDetails)
            res.send(apiResponse)
        }
    })
}





module.exports = {
    addMeeting: addMeeting,
    getAllMeetingsByParticipantId: getAllMeetingsByParticipantId,
    getMeetingById: getMeetingById,
    editMeeting: editMeeting,
    deleteMeeting: deleteMeeting
}