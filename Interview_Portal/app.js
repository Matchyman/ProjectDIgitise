var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var port = 3000;
var bodyparser = require('body-parser');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
const sql = require('mssql');


module.exports = app;

//const { jsPDF } = require("jspdf");
//const config = require("./security/db.json");
//const { connect } = require('http2');
//const { isBuffer } = require('util');
//var fs = require('fs');
// =========== MYSQL INFORMATION ===========

// var pool = mysql.createPool({ // To change the details, change the values in security/db.json
//     host: config.host,
//     user: config.user,
//     password: config.password,
//     database: config.database,
//     multipleStatements: true
// });

// =========== MSSQL INFORMATION ===========


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


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}/`)
});