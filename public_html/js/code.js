
function getUsername() {
    let x = decodeURIComponent(document.cookie);
    console.log(x);
    return x;
}

function createAccount() {
    let isInstructor = $('#instructor');
    if (isInstructor.prop("checked")) {
        createTeacherAccount();
    } else {
        createStudentAccount();
    }
}

function createStudentAccount() {
    console.log('Creating student account...')
    let name = $('#name').val();
    let password = $('#pass').val();
    let email = $('#email').val();

    $.post('/account/student/create', {
        name: name,
        password: password,
        email: email
    }, (data, status) => {
        alert(data);
    });
}

function createTeacherAccount() {
    console.log('Creating teacher account...');
    let name = $('#name').val();
    let password = $('#pass').val();
    let email = $('#email').val();

    $.post('/account/teacher/create', {
        name: name,
        password: password,
        email: email
    }, (data, status) => {
        alert(data);
    })
}

function loginAccount() {
    let isInstructor = $('#instructor');
    if (isInstructor.prop("checked")) {
        loginTeacher();
    } else {
        loginStudent();
    }
}

function loginStudent() {
    console.log('Logging in student...');
    let email = $('#email').val();
    let pass = $('#pass').val();
    $.get('/account/student/login/' + email + '/' + pass, (data, status) => {
        if (data == 'SUCCESS') {
            window.location.href = '/student-homepage.html';
        } else {
            alert(data);
        }
    })
}

function loginTeacher() {
    console.log('Logging in teacher...');
    let email = $('#email').val();
    let pass = $('#pass').val();
    $.get('/account/teacher/login/' + email + '/' + pass, (data, status) => {
        if (data == 'SUCCESS') {
            window.location.href = '/instructor-homepage.html';
        } else {
            alert(data);
        }
    })
}

