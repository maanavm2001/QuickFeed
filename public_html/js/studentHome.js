
var user = getUser();

function getUser() {
    let x = decodeURIComponent(document.cookie);
    x = JSON.parse(x.split(':').slice(1).join(':')).user;
    return x;
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

function joinCourse() {
    let courseID = $('#link-input').val();
    $.post('/app/student/class/join', {
        courseID: courseID
    }, (data, status) => {
        console.log(data);
        window.location.href = data;
    });
}

function signOut() {
    $.get('/account/signout/' + user._id, (data, status) => {
        window.location.href = data;
    })
}

$(document).ready(function() {
    $('#username').text(user.name);
})

function goToCoursePage(courseID) {
    window.location.href = 'student-course-page.html?classID=' + courseID;
}