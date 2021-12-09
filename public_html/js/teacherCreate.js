// Programmer: Francisco
// This is the client-side
// javascript for the teacher add course page
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

//creates a course
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

//shows links when course is created
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
