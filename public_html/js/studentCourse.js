var user = getUser();
var course;

function getUser() {
    let x = decodeURIComponent(document.cookie);
    x = JSON.parse(x.split(':').slice(1).join(':')).user;
    return x;
}

function showCourseDetails() {
    let courseDiv = document.getElementById('course-name');
    courseDiv.html = '';
    resStr = '<h1>' + course.name + '</h1>';
    resStr += '<h6>' + course.semestername + '</h6>';
    courseDiv.innerHTML = resStr;
    if (course.active != true) {
        let courseStatus = document.getElementById('course-status');
        courseStatus.html = '';
        resStr = '<h1>This class is currently not active.</h1>'
        courseStatus.innerHTML = resStr;
    }
}

function sendMessage(messageType) {
    //$.post()
}

function signOut() {
    $.get('/account/signout/' + user._id, (data, status) => {
        window.location.href = data;
    })
}


function getCourseDetails() {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const classID = params.get('classID');
    $.get('/account/course/' + classID, (data, status) => {
        if (data == 'FAIL') {
            alert('fail');
        } else {
            course = JSON.parse(data);
            showCourseDetails();
        }
    })
}
