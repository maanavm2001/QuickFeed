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

function getCourses() {

}

function viewCourses() {

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