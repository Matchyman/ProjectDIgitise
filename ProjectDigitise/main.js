const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const port = 3000;
const bodyparser = require('body-parser');
const app = express();
const { body, validationResult, sanitizeBody, check, oneOf, query } = require('express-validator');

const nodemailer = require('nodemailer');
//File Storage
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, `${req.body['student-number']}.png`)
    }
})

const upload = multer({ storage: storage })
const { request, application } = require('express');
const { from } = require('form-data');
const { sendEmail } = require('./refundModules/emailLogic');
const { makePDFFIle } = require('./interviewModules/pdfCreation');

//Encryption
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);


// =========== MSSQL INFORMATION ===========
/*
const sql = require('mssql');
const sqlConfig = {

        user: 'CredAuth',
        password: 'notgonnausethis',
        database: 'ProjectDigitise',
        server: 'notcreative.co.uk',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }
    // ==========================================
*/

const sql = require('mssql');
const sqlConfig = {

        user: 'SA',
        password: 'Huddersgiant33',
        database: 'TestDB',
        server: 'localhost',

        options:{
            trustServerCertificate : true
        }
    }
    
    
//Interview Subsystem

app.get('/interview', async(req, res) => {

    try {
        await sql.connect(sqlConfig)
        const optQuestions = await sql.query `SELECT TOP 4 * FROM CredibilityQuestions  WHERE isOpen = '1' ORDER BY NEWID() `
            // console.log(optQuestions.recordset)
        const nonOpenQuestions = await sql.query `
            SELECT * FROM (
                SELECT TOP 9 * FROM CredibilityQuestions 
                WHERE isOpen = '0'
                ORDER BY NEWID()
            ) A
            UNION ALL
            SELECT * FROM (
                SELECT TOP 2 * FROM CredibilityQuestions
                WHERE isOpen = '1'
                ORDER BY NEWID()
            ) B
            `
        res.render('interview_p.html', { data: nonOpenQuestions.recordset, data2: optQuestions.recordset, date: getDate() });
    } catch (err) {
        console.log(err)
    }

});

//Admin page logic
app.get('/interview/admin', async(req, res) => {
    try {
        await sql.connect(sqlConfig)
        const allQuestions = await sql.query `SELECT * FROM CredibilityQuestions`
        res.render('interview_admin.html', { admindata: allQuestions.recordset });
    } catch (err) {
        console.log(err)
    }
});


//Insert questions
app.post('/interview/addQ', async(req, res) => {
    // console.log(`${req.body.question}\n ${req.body.sampleAnswer}\n ${req.body.isOpenRadio}`);
    question = `${req.body.question}`;
    sampleAnswer = `${req.body.sampleAnswer}`;
    isOpenRadio = req.body.isOpenRadio;
    try {
        await sql.connect(sqlConfig)
        await sql.query `INSERT INTO CredibilityQuestions (question, sampleAnswer, isOpen) VALUES (${question}, ${sampleAnswer}, ${isOpenRadio});`
        res.redirect('/admin');
    } catch (err) {
        console.log(err)
    }
});


//Delete questions
app.post('/interview/deleteQ', async(req, res) => {
    idToDelete = req.body.questionID;
    try {
        await sql.connect(sqlConfig)
        await sql.query `DELETE FROM CredibilityQuestions WHERE id = ${idToDelete}`;
        res.redirect('/admin');
    } catch (err) {
        console.log(err)
    }
});

//Update Questions
app.post('/interview/updateQ', async(req, res) => {
    idtoUpdate = req.body.questionID;
    //question = `${req.body.question[0]}`;
    sampleAnswer = `${req.body.question[1]}`;
    console.log(`${idtoUpdate}\n${question}\n${sampleAnswer}`)
    try {
        await sql.connect(sqlConfig)
        await sql.query(`UPDATE CredibilityQuestions SET [question] = '${question}', [sampleAnswer] = '${sampleAnswer}' WHERE id = ${idtoUpdate}`)
        res.redirect('/admin');
    } catch (err) {
        console.log(err)
    }

});

function getDate() {
    d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

//Post Request, Sending data to report page
app.post('/interview/report', (req, res) => {
    data = req.body;
    makePDFFIle(data);

    res.render(path.join('interview_report.html'), { data: data });

});

//Post Request Interview page, for randomisation and resetting of form
app.post('/interview', (req, res) => {
    res.redirect('/interview');
});

//===================================================================

//=========================Refund Portal=============================

app.get('/refunds/:stuID', async(req, res) => { // The applicant applies here for the refund.
    const errors = []

    
        //console.log(req.params['stunum'].length)    
    if (req.params['stuID'].length == 7) {
        res.render('application.html', { 'errors': errors, 'stuID': req.params['stuID'] });
        console.log(`Viewing: Application`);
    } else {
        res.redirect('http://www.bolton.ac.uk');
    }
})


app.get('/', (req, res) => {
    res.redirect(`/refunds`);
    console.log(`Landing here, redirecting to -> refund form`);
})




app.post('/refunds/:stuID',
    upload.single('ref-notice-file'),

    //@portal-transfer validation
    body('ref-first-name').trim().escape().isLength({ min: 1 }).withMessage('Empty first name').isAlpha().withMessage('First name must contain alphabet letters'),
    body('ref-last-name').trim().escape().isLength({ min: 1 }).withMessage('Empty last name').isAlpha().withMessage('Last name must contain alphabet letters'),
    body('student-number').trim().escape().isLength({ min: 7, max: 7 }).withMessage('Student number must be 7 digits').isNumeric().withMessage('[Student Number] must not contain alphabetic letters'),

    //@portal-extra validation
    body('ref-payer-first-name').optional({ checkFalsy: true }).trim().escape().isLength({ min: 1 }).withMessage('Empty first name').isAlpha().withMessage('First name must contain alphabet letters'),
    body('ref-payer-last-name').optional({ checkFalsy: true }).trim().escape().isLength({ min: 1 }).withMessage('Empty last name').isAlpha().withMessage('Last name must contain alphabet letters'),
    body('ref-payer-address').optional({ checkFalsy: true }).escape().isLength({ min: 1 }).withMessage('Address must be filled in'),

    //@international-transfer validation
    body('ref-acc-name-it').optional({ checkFalsy: true }).trim().escape().isLength({ min: 1 }).withMessage('Empty account name').isAlpha().withMessage('[Account Name] must contain alphabet letters'),
    body('ref-acc-num-it').optional({ checkFalsy: true }).trim().escape().isIBAN().withMessage('[Account Number] This is not a valid IBAN number'),
    body('ref-swift-code-it').optional({ checkFalsy: true }).trim().escape().isBIC().withMessage('[Swift Code] This is not a valid code'),
    body('ref-bank-name-it').optional({ checkFalsy: true }).trim().escape().isAlpha().withMessage('[Bank Name] Please only use alphabetic characters'),
    body('ref-bank-address-it').optional({ checkFalsy: true }).escape().isAlphanumeric().withMessage('[Bank Address] Please do not use any symbols'),

    //@home-transfer validation
    check('ref-acc-name-ht').optional({ checkFalsy: true }).custom((value) => {
        return value.match(/^[A-Za-z ]+$/);
    }).withMessage("Please only use alphabetic letters").escape(),
    body('ref-acc-num-ht').optional({ checkFalsy: true }).trim().escape().isLength({ min: 8, max: 8 }).withMessage('Account Number must be 8 digits long').isNumeric().withMessage('Must only use numbers'),
    check('ref-sort-code-ht').optional({ checkFalsy: true }).escape().isAlphanumeric().withMessage('[Sort Code] Must only contain digits'),
    check('ref-sort-code-ht1').optional({ checkFalsy: true }).escape().isAlphanumeric().withMessage('[Sort Code] Must only contain digits'),
    check('ref-sort-code-ht2').optional({ checkFalsy: true }).escape().isAlphanumeric().withMessage('[Sort Code] Must only contain digits'),

    //@portal-extra2 validation
    check('ref-reason').optional({ checkFalsy: true }).custom((value) => {
        return value.match(/^[A-Za-z ]+$/);
    }).withMessage("Please only use alphabetic letters [Ref Reason]").escape(),
    //Custom validator for image file
    check('ref-notice-file').optional({ checkFalsy: true }).custom((value, { req }) => {
        if (req.file.mimetype === 'image/png') {
            return '.png';
        } else if (req.file.mimetype === 'image/jpg') {
            return '.jpeg';
        } else {
            return false;
        }
    }).withMessage("Please only upload png or jpeg documents"),
    check('ref-ex-reason').optional({ checkFalsy: true }).custom((value) => {
        return value.match(/^[A-Za-z ]+$/);
    }).withMessage("Please only use alphabetic letters [Visa Refusal]").escape(),
    body('t/c-accepted').toBoolean(),

    async(req, res) => {
        //console.log(req.file);
        const errors = validationResult(req);
        //console.log(req.body);

        if (!errors.isEmpty()) {
            //console.log(errors.array());
            res.render('application.html', { errors: errors.array() });
        } else {
            console.log("Free of errors insert into database")
            await sql.connect(sqlConfig)
            const request = new sql.Request()
            request.input('student_number', req.body['student-number'])
            try {

                request.input('stu_pay', req.body['stu-pay'])
                request.input('title', req.body['ref-title'])
                request.input('first_name', req.body['ref-first-name'])
                request.input('last_name', req.body['ref-last-name'])


                request.input('payer_title', req.body['ref-payer-title'])
                request.input('payer_first_name', req.body['ref-payer-first-name'])
                request.input('payer_last_name', req.body['ref-payer-last-name'])
                request.input('payer_address', req.body['ref-payer-address'])

                request.input('acc_name_it', req.body['ref-acc-name-it'])
                request.input('acc_num_it', req.body['ref-acc-num-it'])
                request.input('swift_code_it', req.body['ref-swift-code-it'])
                request.input('bank_name_it', req.body['ref-bank-name-it'])
                request.input('bank_address_it', req.body['ref-bank-address-it'])

                request.input('acc_name_ht', req.body['ref-acc-name-ht'])
                request.input('acc_num_ht', req.body['ref-acc-num-ht'])
                request.input('sort_code_ht', req.body['ref-sort-code-ht'] + req.body['ref-sort-code-ht1'] + req.body['ref-sort-code-ht2'])

                request.input('reason', req.body['ref-reason'])
                request.input('fileinput', req.body['student-number'])
                request.input('ex_reasons', req.body['ref-ex-reasons'])


                request.query('INSERT INTO refunds(pay_type, title, first_name, last_name, student_number) VALUES (@stu_pay, @title, @first_name,@last_name, @student_number);')
                    
                

            } catch (error) {
                console.log(error)
            }
            
            console.log("Application Recieved Send email [application]");
            sendEmail("app");
            res.redirect('/submission/'+ req.body['student-number'])
            //res.redirect(`/refunds/`+ req.body['student-number']);
        }

    })
    /*
    'payer_title, payer_first_name, payer_last_name, payer_address,' +
                    'acc_name_it, acc_iban_it, acc_swift_it, acc_bank_name_it, acc_bank_address_it,' +
                    'acc_name_ht, acc_num_ht, acc_sort_code, ref_reason, visa_ref_file, ref_ex_reason

                    '@payer_title, @payer_first_name, @payer_last_name,@payer_address,' +
                    '@acc_name_it, @acc_num_it, @swift_code_it, @bank_name_it, @bank_address_it,' +
                    '@acc_name_ht, @acc_num_ht, @sort_code_ht, @reason, @fileinput, @ex_reasons
    */

// Might not even need this if we are going to use active directory groups
app.get('/login', (req, res) => {
    res.render('login.html');
})

var Authcheck = false;
async function getAuth(username, password) {
    await sql.connect(sqlConfig);
    const request = new sql.Request();
    request.input('username', username);
    request.query('SELECT password FROM authentication WHERE username = @username', (err, result) => {
        if (typeof result.recordset[0] !== 'undefined') {
            hash = `${result.recordset[0].password}`;
            Authcheck = bcrypt.compareSync(`${password}`, hash);
            if (Authcheck = true) {
                Authcheck = true;
            } else {
                Authcheck = false;
            }
        } else {
            Authcheck = false;
        }
    });
}

app.post('/postLogin', async(req, res) => {
    getAuth(req.body.username, req.body.password);
    console.log(Authcheck)
    if (!Authcheck) {
        console.log(`User Authenticated -> Proceed to login`)
        console.log("Now Viewing Management Page");

    } else {
        console.log(`User NOT Authenticated -> Redirect`)
        res.redirect('/login');
    }

})

app.get('/management', async(req, res) => {
    await sql.connect(sqlConfig)
    const request = new sql.Request()
    request.query('select * from refunds', (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.render('management.html', { data: result });
        }
    })
});


app.post('/intsubmission', async(req, res) => {
    console.log(req.body);

    await sql.connect(sqlConfig)
    const request = new sql.Request()

    request.input('stu_num', req.body['stu_num'])
    request.input('dec_date', sql.Date, getdate())
    if (req.body['intAccept'] === 'true') {
        // console.log('Update Database with Accept')
        request.query('update refunds set int_accept = 1, int_dec_date = @dec_date where student_number = @stu_num ');
        console.log('Update Database with Accept [international]');
        sendEmail("int");
    } else {
        console.log('Update Database with Deny [international]');
        request.input('denyReason', req.body['denyReason'])
        request.query('update refunds set int_accept = 0, int_rej_reason = @denyReason, fi_accept = 0, int_dec_date = @dec_date where student_number = @stu_num ');
        sendEmailDeny("deny")
    }

    res.redirect('/management');


})

app.post('/fisubmission', async(req, res) => {
    console.log("Now Posting Finance Submission Page");
    await sql.connect(sqlConfig)
    const request = new sql.Request()
    request.input('stu_num', req.body['stu_num'])
    request.input('dec_date', sql.Date, getdate())
    if (req.body['fiAccept'] === 'true') {
        console.log('Update Database with Accept [finance]')
        request.query('update refunds set fi_accept = 1, fi_dec_date = @dec_date where student_number = @stu_num ');
        console.log('Update Database with Accept')
        sendEmail("fi")
    } else {
        console.log('Update Database with Deny [finance]')
        request.input('denyReason', req.body['denyReason'])
        request.query('update refunds set fi_accept = 0, fi_rej_reason = @denyReason, fi_dec_date = @dec_date where student_number = @stu_num ');
        sendEmailDeny("deny")
    }

    res.redirect('/management');
})


//Landing Page

app.get('/submission/:stuID', (req, res) =>{
    console.log("Going to submission conformation page");
    res.render('refund_submit.html');
})




function getdate() {
    //dd-mm-yyyy format
    d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}




//===================================================================




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}/`)
});