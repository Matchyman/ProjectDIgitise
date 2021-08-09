const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult, sanitizeBody, check, oneOf, query } = require('express-validator');
const nodemailer = require('nodemailer');
const multer = require('multer');


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, `${req.body['student-number']}.png`)
    }
})
var upload = multer({ storage: storage })
const app = express()
const port = 3000;

const { request, application } = require('express');
const { from } = require('form-data');
const { sendEmail } = require('./refundModules/emailLogic');

const bcrypt = require('bcrypt');
const saltRounds = 10;

// =========== MSSQL INFORMATION ===========
const sql = require('mssql');
const sqlConfig = {
    user: '',
    password: '',
    database: 'ProjectDigtise',
    table: 'Refunds',
    server: 'localhost',
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



app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/')); // Assets go in the public folder.
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/application', async(req, res) => { // The applicant applies here for the refund.
    const errors = []
    res.render('application.html', { 'errors': errors });
    getDate();
    console.log(`Viewing: Application`);
})

app.get('/', (req, res) => {
    res.redirect(`application`);
    console.log(`Landing here, redirecting to -> application`);
})


// @TODO Add in functionality for email to be sent

app.post('/application',
    upload.single('ref-notice-file'),

    //@portal-transfer validation
    body('ref-first-name').trim().escape().isLength({ min: 1 }).withMessage('Empty first name').isAlpha().withMessage('First name must contain alphabet letters'),
    body('ref-last-name').trim().escape().isLength({ min: 1 }).withMessage('Empty last name').isAlpha().withMessage('Last name must contain alphabet letters'),
    body('student-number').trim().escape().isLength({ min: 7, max: 7 }).withMessage('Student number must be 7 digits').isNumeric().withMessage('[Student Number] must not contain alphabetic letters'),

    //@portal-extra validation
    body('ref-payer-first-name').optional({ checkFalsy: true }).trim().escape().isLength({ min: 1 }).withMessage('Empty first name').isAlpha().withMessage('First name must contain alphabet letters'),
    body('ref-payer-last-name').optional({ checkFalsy: true }).trim().escape().isLength({ min: 1 }).withMessage('Empty last name').isAlpha().withMessage('Last name must contain alphabet letters'),
    body('ref-payer-address').optional({ checkFalsy: true }).escape().isLength({ min: 1 }).withMessage('Address must be filled in'),

    //@international-transfer validation @TODO finish validation for this part
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
        console.log(req.file);
        const errors = validationResult(req);
        console.log(req.body);

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


                request.query('INSERT INTO refunds' +
                    '(pay_type, title, first_name, last_name, student_number,' +
                    'payer_title, payer_first_name, payer_last_name, payer_address,' +
                    'acc_name_it, acc_iban_it, acc_swift_it, acc_bank_name_it, acc_bank_address_it,' +
                    'acc_name_ht, acc_num_ht, acc_sort_code, ref_reason, visa_ref_file, ref_ex_reason) VALUES' +

                    '(@stu_pay, @title, @first_name,@last_name, @student_number,' +
                    '@payer_title, @payer_first_name, @payer_last_name,@payer_address,' +
                    '@acc_name_it, @acc_num_it, @swift_code_it, @bank_name_it, @bank_address_it,' +
                    '@acc_name_ht, @acc_num_ht, @sort_code_ht, @reason, @fileinput, @ex_reasons);'
                )

            } catch (error) {
                console.log(error)
            }

            console.log("Application Recieved Send email [application]");

            sendEmail("app");
            res.redirect('application');
        }

    })

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
        await sql.connect(sqlConfig)
        const request = new sql.Request()
        request.query('select * from refunds', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                //console.log(result);
                res.render('management.html', { data: result });
            }
        })
    } else {
        console.log(`User NOT Authenticated -> Redirect`)
        res.redirect('/login');
    }

})

app.post('/intsubmission', async(req, res) => {
    console.log(req.body);

    await sql.connect(sqlConfig)
    const request = new sql.Request()

    request.input('stu_num', req.body['stu_num'])
    request.input('dec_date', sql.Date, getDate())
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

    res.redirect(307, '/postLogin');


})

app.post('/fisubmission', async(req, res) => {
    console.log("Now Posting Finance Submission Page");
    await sql.connect(sqlConfig)
    const request = new sql.Request()
    request.input('stu_num', req.body['stu_num'])
    request.input('dec_date', sql.Date, getDate())
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

    res.redirect(307, '/postLogin');
})



app.post('/search', (req, res) => { //
    // @TODO: implement search function here once data is acquired.
})

app.listen(port, () => {
    console.log(`Application started @ http://localhost:${port}`)
})

function getDate() {
    //dd-mm-yyyy format
    d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}