// Programmer: Francisco
// This is the client-side
// javascript for the teachers course page
// Uses jquery
var user = getUser();
var course;

// gets users
function getUser() {
    const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('login='))
    .split('=')[1]
    let x = decodeURIComponent(cookieValue);
    x = JSON.parse(x.split(':').slice(1).join(':')).user;
    return x;
}

// gets all course details
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
            showStudents(course.students);
            setCopyButton();
            buttonSetup();
        }
    })
}

// makes the student list
function showStudents(data) {
    let studentList = document.getElementById('student-list');
    studentList.html = '';
    resStr = '<h1> Students </h1>';
    for (var i in data) {
        innerDiv = '<p class=student-name>' + data[i].name + '</p>';

        resStr += innerDiv;
    }
    studentList.innerHTML = resStr;
}

function showCourseDetails() {
    $('#course-name').text(course.name);
    $('#semester-name').text(course.semestername);
}

function signOut() {
    $.get('/account/signout/' + user._id, (data, status) => {
        window.location.href = data;
    })
}

function setCopyButton() {
    $('#copy-button').click(function() {
        copyTextToClipboard(course._id);
      });
}

// starts class IMPORTANT
function startClass() {
    $.get('/app/' + course._id + '/start'), (data, status) => {
        if (data == 'FAIL') {
            alert('FAILURE')
        } else {
            course.active = true;
            changeButton();
            location.reload();
        }
    }
}

// stops class
function stopClass() {
    $.get('/app/' + course._id + '/stop'), (data, status) => {
        if (data == 'FAIL') {
            alert("FAILURE")
        } else {
            course.active = false;
            changeButton();
            location.reload();
        }
    }
}

// makes the start button work as a stop button
function changeButton() {
    if (course.active == true) {
        $('#on-off').css('background-color', 'red');
        $('#on-off').text('Stop Class');
    } else {
        $('#on-off').css('background-color', 'white');
        $('#on-off').text('Start Class');
    }
}

function buttonSetup() {
    changeButton();
    $('#on-off').click(function() {
        if (course.active == true) {
            stopClass();
        } else {
            startClass();
        }
    })
}


function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
        $('#copy-button').text("Copied!");

    } catch (err) {
      console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}
