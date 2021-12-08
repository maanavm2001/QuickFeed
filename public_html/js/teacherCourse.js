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

    /*
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
  
    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';
  
    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;
  
    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
  
    // Avoid flash of the white box if rendered for any reason.
    textArea.style.background = 'transparent';
  
    */
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
