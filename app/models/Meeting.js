'user strict'
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let meetingSchema = new Schema({
    meetingId: {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    meetingName: {
        type: String,
        default: ''
    },
    meetingDescription: {
        type: String,
        default: ''
    },
    organizerId: {
        type: String,
        default: ''
    },
    organizerName: {
        type: String,
        default: ''
    },
    participantId: {
        type: String,
        default: ''
    },
    participantName: {
        type: String,
        default: ''
    },
    participantEmail: {
        type: String,
        default: ''
    },
    meetingStartDateAndTime: {
        type: Date,
        default: ''
    },
    meetingEndDateAndTime: {
        type: Date,
        default: ''
    },
    meetingLocation: {
        type: String,
        default: ''
    }
})
mongoose.model('Meeting', meetingSchema)