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
                    template: 'appRecieved',
                    message: {
                        to: 'jmatcham31@googlemail.com'
                    },
                    locals : {
                        stunum:'1234567'
                    }
                })
                .then(console.log)
                .catch(console.error);

            
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
            
            break;

        default:
            break;
    }


}