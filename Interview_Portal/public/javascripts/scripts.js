function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function startTime() {
    var date = new Date();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var btn = document.getElementById("startInterviewTime");
    //Now we check to see if a "0" needs adding
    mm = checkTime(mm);
    var startTime = hh + ":" + mm;
    //Display time started and remove the button
    btn.remove();
    document.getElementById("starttimebtn").innerHTML = "Interview Started At: " + startTime;
    document.getElementById("interviewTimeStart").value = startTime;
}

function endTime() {
    var date = new Date();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var btn = document.getElementById("endInterviewTime");
    //Now we check to see if a "0" needs adding
    mm = checkTime(mm);

    var endTime = hh + ":" + mm;

    //Display time started and remove the button
    btn.remove();
    document.getElementById("endtimebtn").innerHTML = "Interview Finished At: " + endTime;
    document.getElementById("interviewTimeEnd").value = endTime;
}