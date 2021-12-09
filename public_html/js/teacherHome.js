// Programmer: Francisco
// This is the client-side
// javascript for the teacher home page
// Uses jquery

var user = getUser();


function getUser() {
    const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('login='))
    .split('=')[1]
    let x = decodeURIComponent(cookieValue);
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

//all courses
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

function signOut() {
    $.get('/account/signout/' + user._id, (data, status) => {
        window.location.href = data;
    })
}

$(document).ready(function() {
    $('#username').text(user.name);
})
