const nodemailer = require('nodemailer');
const Email = require('email-templates');

//https://email-templates.js.org/#/
//All email templates are in emails folder

module.exports = {
    sendEmail,
}

const email = new Email({
    message: {
        from: 'projectdigitiserefundportal@gmail.com'
    },
    //Uncomment below to actually send emails
    //send: true,
    transport: nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'projectdigitiserefundportal@gmail.com',
            pass: 'projectdigitise'
        }
    })

});


function sendEmail(stage) {

    switch (stage) {
        case "app":
            email.send({
                    template: 'appSuccess',
                    message: {
                        to: ''
                    },
                })
                .then(console.log)
                .catch(console.error);

            /*
            transporter.sendMail(appAccepted, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent' + info.response);
                }
            });
            */
            break;
        case "int":
            email.send({
                    template: 'intSuccess',
                    message: {
                        to: ''
                    },
                })
                .then(console.log)
                .catch(console.error);
            /*transporter.sendMail(intAccepted, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent' + info.response);
                }
            });
            */
            break;
        case "fi":
            email.send({
                    template: 'fiSuccess',
                    message: {
                        to: ''
                    },
                })
                .then(console.log)
                .catch(console.error);
            /*
            transporter.sendMail(fiAccepted, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent' + info.response);
                }
            });*/
            break;
        case "deny":
            email.send({
                    template: 'denyApp',
                    message: {
                        to: ''
                    },
                })
                .then(console.log)
                .catch(console.error);
            /*
            transporter.sendMail(denied, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent' + info.response);
                }
            });
            */
            break;

        default:
            break;
    }


}