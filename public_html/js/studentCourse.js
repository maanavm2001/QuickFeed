var user = getUser();
var course;


function getUser() {
    const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('login='))
    .split('=')[1]
    let x = decodeURIComponent(cookieValue);
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
    console.log('button pressed');
    $.get('/app/' + course._id + '/message/:type'), {
        type: messageType
    }, (data, status) => {
        console.log(data);
        showAlert(data);
    }
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

function showAlert(alert) {
    if (alert == 'FAIL') {
        $('#error').text("Error saving message.");
        $('#error').css('visibility', 'visible');
    } else {
        $('#error').text('Message saved!')
    }
}

function buttonSetup() {
    $('#ts').click(function() {
        sendMessage('S');
    })
    $('#tf').click(function() {
        sendMessage('F');
    })
    $('#conf').click(function() {
        sendMessage('C');
    })
    $('#gj').click(function() {
        sendMessage('G');
    })
}

$(document).ready(function() {
    buttonSetup();
})