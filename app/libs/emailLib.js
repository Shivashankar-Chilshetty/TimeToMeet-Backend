'use strict';
const nodemailer = require('nodemailer');

let sendEmail = (sendEmailOptions) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sushantss9151@gmail.com',
            pass: 'sushantrj@007'
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'sushantss9151@gmail.com', // sender address
        to: sendEmailOptions.email, //  receiver address
        //to: 'chilshetty77@gmail.com',
        subject: sendEmailOptions.subject, // Subject line
        html: sendEmailOptions.html // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        else {
            console.log('Message successfully sent.', info.response);
        }

    });
}

module.exports = {
    sendEmail: sendEmail
}
