const { jsPDF } = require("jspdf");

module.exports = {
    makePDFFIle
}

function makePDFFIle(pdfdata) { //
    const doc = new jsPDF();
    // ================= Report Section START
    doc.text(`UoB Interview Report`, 100, 10, null, null, "center");
    doc.line(10, 15, 200, 15); // horizontal line
    doc.setFontSize(10);
    // ================= Student Info
    doc.text(` 
    Student ID: ${pdfdata.studentId}
    Student Name: ${pdfdata.studentName}
    Home Number: ${pdfdata.homeNumber}
    Mobile Number: ${pdfdata.mobileNumber}
    ID Checked: ${pdfdata.idCheckComplete} | Type: ${pdfdata.idCheckCompleteType}
    `, 6, 20);
    // ================== Interviewer Info
    doc.text(` 
    Interviewer By: ${pdfdata.interviewerName}
    Interview Start Time: ${pdfdata.interviewTimeStart}
    Interview End Time: ${pdfdata.interviewTimeEnd}
    `, 135, 20);

    doc.line(10, 50, 200, 50); // horizontal line
    // ================== Questions Asked

    // ${pdfdata.question[1]}
    // Comments: ${pdfdata.commentsArea[1]}
    var strArr = doc.splitTextToSize(pdfdata.question[0], 144)
    doc.text(strArr, 10, 60);
    // ${pdfdata.question[2]}
    // Comments: ${pdfdata.commentsArea[2]}
    var strArr = doc.splitTextToSize(pdfdata.question[1], 144)
    doc.text(strArr, 10, 72);
    // ${pdfdata.question[3]}
    // Comments: ${pdfdata.commentsArea[3]}
    var strArr = doc.splitTextToSize(pdfdata.question[2], 144)
    doc.text(strArr, 10, 84.5);
    // ${pdfdata.question[4]}
    // Comments: ${pdfdata.commentsArea[4]}
    var strArr = doc.splitTextToSize(pdfdata.question[3], 144)
    doc.text(strArr, 10, 96.5);
    // ${pdfdata.question[5]}
    // Comments: ${pdfdata.commentsArea[5]}
    var strArr = doc.splitTextToSize(pdfdata.question[4], 144)
    doc.text(strArr, 10, 109);
    // ${pdfdata.question[6]}
    // Comments: ${pdfdata.commentsArea[6]}
    var strArr = doc.splitTextToSize(pdfdata.question[5], 144)
    doc.text(strArr, 10, 121);

    var strArr = doc.splitTextToSize(pdfdata.question[6], 144)
    doc.text(strArr, 10, 133);

    var strArr = doc.splitTextToSize(pdfdata.question[7], 144)
    doc.text(strArr, 10, 145);

    var strArr = doc.splitTextToSize(pdfdata.question[8], 144)
    doc.text(strArr, 10, 158);

    var strArr = doc.splitTextToSize(pdfdata.question[9], 144)
    doc.text(strArr, 10, 170);

    // ============================================================================================= COMMENTS SECTION =========================

    doc.text(`Comments:`, 10, 68);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[0], 144)
    doc.text(strArr, 30, 68);

    doc.text(`Comments:`, 10, 81);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[1], 144)
    doc.text(strArr, 30, 81);

    doc.text(`Comments:`, 10, 93);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[2], 144)
    doc.text(strArr, 30, 93);

    doc.text(`Comments:`, 10, 105.5);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[3], 144)
    doc.text(strArr, 30, 105.5);

    doc.text(`Comments:`, 10, 117.5);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[4], 144)
    doc.text(strArr, 30, 117.5);

    doc.text(`Comments:`, 10, 129.5);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[5], 144)
    doc.text(strArr, 30, 129.5);

    doc.text(`Comments:`, 10, 141.5);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[6], 144)
    doc.text(strArr, 30, 141.5);

    doc.text(`Comments:`, 10, 154.5);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[7], 144)
    doc.text(strArr, 30, 154.5);

    doc.text(`Comments:`, 10, 166.5);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[8], 144)
    doc.text(strArr, 30, 166.5);

    doc.text(`Comments:`, 10, 178);
    var strArr = doc.splitTextToSize(pdfdata.commentsArea[9], 144)
    doc.text(strArr, 30, 178);



    // ============================================================================================= WORKING ABOVE HERE =======================
    // ================== Level of Satisfaction for each level
    doc.text(` 
    Answer Rating: ${pdfdata.satisfsactionOptionSelection[0]}


    Answer Rating: ${pdfdata.satisfsactionOptionSelection[1]}


    Answer Rating: ${pdfdata.satisfsactionOptionSelection[2]}


    Answer Rating: ${pdfdata.satisfsactionOptionSelection[3]}


    Answer Rating: ${pdfdata.satisfsactionOptionSelection[4]}


    Answer Rating: ${pdfdata.satisfsactionOptionSelection[5]}


    Answer Rating: ${pdfdata.satisfsactionOptionSelection[6]}
    

    Answer Rating: ${pdfdata.satisfsactionOptionSelection[7]}
    

    Answer Rating: ${pdfdata.satisfsactionOptionSelection[8]}
    

    Answer Rating: ${pdfdata.satisfsactionOptionSelection[9]}
    `, 150, 55.9);
    doc.line(152.5, 57, 152.5, 170); // Seperator between Questions | Satisfactory Levels
    // ================== Optional Questions Asked
    doc.text(` 
    Optional Questions:

    ${pdfdata.optquestion[0]}
    Comments: ${pdfdata.commentsArea2[0]}
    ${pdfdata.optquestion[1]}
    Comments: ${pdfdata.commentsArea2[1]}
    ${pdfdata.optquestion[2]}
    Comments: ${pdfdata.commentsArea2[2]}
    `, 6, 185);
    // ================== Level of Satisfaction for each level
    doc.text(` 
    Answer Rating: ${pdfdata.satisfsactionOptionSelection2[0]}

    Answer Rating: ${pdfdata.satisfsactionOptionSelection2[1]}

    Answer Rating: ${pdfdata.satisfsactionOptionSelection2[2]}
    `, 150, 192.5);
    doc.line(152.5, 193.5, 152.5, 213.5); // Seperator between Questions | Satisfactory Levels
    doc.line(10, 220, 200, 220); // horizontal line
    doc.text(`Overall Comments:`, 10, 225);
    var strArr = doc.splitTextToSize(pdfdata.overallCommentsText, 185)
    doc.text(strArr, 10, 230);
    doc.text(`Zoom Link:`, 10, 245);
    var strArr = doc.splitTextToSize(pdfdata.zoomLink, 166)
    doc.text(strArr, 29, 245);
    doc.text(`Recommendation: ${pdfdata.recomendationOption}`, 10, 260);
    doc.text(`Reason(s): ${pdfdata.recomendationReasons}`, 10, 265);

    doc.save(`${pdfdata.studentId}.pdf`); //@TODO: Pending a saving to a folder solution.

    var oldPath = `./${pdfdata.studentId}.pdf`;
    var newPath = `./PDF/${pdfdata.studentId}.pdf`;

    fs.rename(oldPath, newPath, function(err) {
            if (err) throw err
            console.log('Created Record & Moved To PDF Folder');
        })
        // doc.save(`test.pdf`); //@TODO: Pending a saving to a folder solution.
}