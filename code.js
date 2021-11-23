

function createStudentAccount() {
    let username = $('#username').val;
    let password = $('#password').val;
    let studentName = $('#studentName').val;
    $.post('/account/student/create', {
        username: username,
        password: password,
        studentname: studentName
    })
}

function createTeacherAccount() {
    let username = $('#teacherUsername').val;
    let password = $('#password').val;
    let teacherName = $('#teacherName').val;
    $.post('/account/teacher/create', {
        username: username,
        password: password,
        teachername: teacherName
    })
}

function createClass() {
    let className = $('#className').val;
    let teacherName = $('#teacherName').val;
    let classLength = $('#classLength').val;

    $.post('/app/teacher/class/create', {
        classname: className,
        teachername: teacherName,
        length: classLength
    })
}

function getClass() {
    var className = $('#className');
    $.get('app/:class/:type')
}

function viewClass(data) {

}