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
    
}

$(document).ready(function() {
    console.log(user.name)
    $('#username').text(user.name);
})