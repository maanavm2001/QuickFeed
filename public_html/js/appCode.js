var user = getUser();

function getUser() {
    let x = decodeURIComponent(document.cookie);
    x = JSON.parse(x.split(':').slice(1).join(':')).user;

    console.log(x);
    return x;
}

function getUsername() {
    return user.name;
}

function getTeacherCourses() {
    $.get('/app/teacher/classes/' + user._id, (data, status) => {
        if (data == 'FAIL') {
            alert("fail");
        } else {
            viewCourses(data);
        }
    })
}

function viewCourses(courses) {
    let courseGallery = document.getElementById('course-gallery');
    courseGallery.html = '';
    let x = JSON.parse(courses).classes;
    console.log(x);
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

function createCourse() {
    var courseName = $('#name').val();
    var semesterName = $('#semester').val();
    var description = $('#description').val();
    
    $.post('/app/teacher/class/create', {
        name: courseName,
        semester: semesterName,
        description: description
    }, (data, status) => {
        alert(data);
    });
}

$(document).ready(function() {
    $('#username').text(user.name);
})