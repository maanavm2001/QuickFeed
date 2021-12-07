var user = getUser();
var currentCourse;

function getUser() {
    let x = decodeURIComponent(document.cookie);
    x = JSON.parse(x.split(':').slice(1).join(':')).user;
    return x;
}

function getTeacherCourses() {
    $.get('/app/teacher/classes/' + user._id, (data, status) => {
        if (data == 'FAIL') {
            alert("fail");
        } else {
            viewCourses(JSON.parse(data).classes);
        }
    })
}

function getStudentCourses() {
    $.get('/app/student/classes/' + user._id, (data, status) => {
        if (data == 'FAIL') {
            alert("fail");
        } else {
            viewCourses(JSON.parse(data).classes);
        }
    })
}

function joinCourse() {
    let courseID = $('#link-input').val();
    $.post('/app/student/class/join', {
        courseID: courseID
    }, (data, status) => {
        console.log(data);
        window.location.href = data;
    });
}

function viewCourses(courses) {
    let courseGallery = document.getElementById('course-gallery');
    courseGallery.html = '';
    let x = courses;
    resStr = '<h1> Courses </h1>';
    for (var i in x) {
        innerDiv = '<div class=course-tile onclick=goToCoursePage("' + x[i]._id + '");>';
        innerDiv += '<h3>' + x[i].name + '</h3>';
        innerDiv += '<h4>' + x[i].semestername + '</h4>';
        innerDiv += '<span class=student-pop> Number of Students: <span class=number>' + x[i].students.length + '</span></span>';
        innerDiv += '</div>';
        resStr += innerDiv;
    }
    courseGallery.innerHTML = resStr;
}

function goToCoursePage(courseID) {
    window.location.href = 'course-page.html?classID=' + courseID;
}

function getCourseDetails() {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const classID = params.get('classID');
    $.get('/account/course/' + classID, (data, status) => {
        if (data == 'FAIL') {
            alert('fail');
        } else {
            currentCourse = JSON.parse(data);
            showCourseDetails();
        }
    })
}

function createCourse() {
    var courseName = $('#name').val();
    var semesterName = $('#semester').val();
    var description = $('#description').val();
    
    $.post('/app/teacher/class/create', {
        name: courseName,
        semester: semesterName,
        description: description
    }, (data, status) => {
        showCourseLink(data);
    });
}

function showCourseLink(classID) {
    let linkSection = document.getElementById('link-section');
    let link = document.getElementById('link');

    link.innerHTML = classID;
    linkSection.style.display = "block";
}

function signOut() {
    $.get('/account/signout/' + user._id, (data, status) => {
        window.location.href = data;
    })
}

function showCourseDetails() {
    $('#course-name').text(currentCourse.name);
    $('#semester-name').text(currentCourse.semestername);
}

$(document).ready(function() {
    $('#username').text(user.name);
})