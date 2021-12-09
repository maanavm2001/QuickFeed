/////////////
///Server ///
// Setup ////
/////////////

const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
var nodemailer = require('nodemailer');
const { v4: uuidv4, NIL } = require('uuid');

////////////////////
////SESSION CODE////
////////////////////
TIMEOUT = 6000000000;
var sessions = {};

function filterSessions() {
    let now = Date.now();
    for (e in sessions) {
        if (sessions[e].time < (now - TIMEOUT)) {
            delete sessions[e];
        }
    }
}

setInterval(filterSessions, 2000);

function putSession(username, sessionKey) {
    if (username in sessions) {
        sessions[username] = { 'key': sessionKey, 'time': Date.now() };
        return sessionKey;
    } else {
        let sessionKey = Math.floor(Math.random() * 1000);
        sessions[username] = { 'key': sessionKey, 'time': Date.now() };
        return sessionKey;
    }
}

function isValidSession(username, sessionKey) {
    if (username in sessions && sessions[username].key == sessionKey) {
        return true;
    }
    return false;
}

/////////////////////////
////END SESSION CODE////
////////////////////////

////////////////
///EMAIL CODE///
////////////////

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'quickfeedteam@gmail.com',
        pass: '@QuickFeed01'
    }
});

const app = express();

app.use(parser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.json());
app.use('/app/*', authenticate);
app.use('/', express.static('public_html'));

const mongoDBURL = 'mongodb://127.0.0.1/QuickFeed';


mongoose.connect(mongoDBURL, { useNewUrlParser: true })
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function() {
    console.log("Connected successfully");
});

//var hash = crypto.createHash('sha512');

//import { resolveSoa } from 'dns';
///////////
//Code/////
//Imports//
//Func.////
///////////

// Models from model.js
var Student = require('./models/Student');
var Teacher = require('./models/Teacher');
var Class = require('./models/Class');
var Message = require('./models/Message');
var Session = require('./models/Session');

var currTime = 0;
var counter;
// User authenticate
function authenticate(req, res, next) {
    if (Object.keys(req.cookies).length > 0) {
        console.log(req.cookies);
        let u = req.cookies.login.user;
        let key = req.cookies.login.key;
        if (isValidSession(u._id, key)) {
            putSession(u._id, key);
            res.cookie("login", { user: u, key: key }, { maxAge: TIMEOUT });
            next();
        } else {
            res.redirect('/index.html');
        }
    } else {
        res.redirect('/index.html');
    }
}

function buildMessage(code, name) {
    finalstring = ''
    timeStamp = getTimeStamp();

    if (code == 'q' || code == 'Q') {
        finalstring += 'At ' + String(timeStamp) + ' ' + String(name) + ' found you confusing!'
    }
    if (code == 's' || code == 'S') {
        finalstring += 'At ' + String(timeStamp) + ' ' + String(name) + ' found you moving slow!'
    }
    if (code == 'f' || code == 'F') {
        finalstring += 'At ' + String(timeStamp) + ' ' + String(name) + ' found you moving too fast!'
    }
    if (code == 'g' || code == 'G') {
        finalstring += 'At ' + String(timeStamp) + ' ' + String(name) + ' thought you were explaing well!'
    }

    return finalstring;
}

function getTimeStamp() {
    const sec = parseInt(currTime, 10);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
}


function email(u, currSession) {
    let body = '';
    emailTo = u.email;

    Session.findOne({ _id: currSession._id })
        .populate("messages")
        .exec(function(err, results) {
            if (err) return handleError(err);
            body = JSON.stringify(results);

            var mailOptions = {
                from: 'quickfeedteam@gmail.com',
                to: String(emailTo),
                subject: 'Today\'s Session Detail',
                text: String(body)
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    currTime = 0
                }
            });
        })

}

function stopClassSession(user, currSession, _callback) {
    clearInterval(counter);

    Session.findOne({ _id: currSession._id }).exec(function(err, results) {
        //if (err) { res.end('couldnt find/error') }
        if (err) {
            _callback(err);
        }
        results.active = false;
        results.save(_callback(err));
        email(user, currSession);
    })
}

function secondUp() {
    currTime++
}

function startClassSession(currClass, _callback) {
    currTime++;
    var d = new Date();
    var NoTimeDate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();

    var classSession = new Session({
        active: true,
        date: NoTimeDate,
        class: currClass._id
    })

    classSession.save()

    Class.findOne({ _id: currClass._id }).exec(function(err, result) {
        if (err) {
            _callback(err, result);
            return;
        }
        //if (err) { res.end('class not found/error') }
        addSessionToClass(currClass._id, classSession._id, function(err, res) {
                _callback(err, classSession);
            })
            //res.cookie("session", { session: classSession }, { maxAge: TIMEOUT });
    })
    counter = setInterval(secondUp, 1000)
}

///////////
//Routes///
///////////


//Account creation/login ////

app.post('/account/student/create', async(req, res) => {
    console.log('Student account being created');
    let reqData = req.body;
    let name = reqData.name;
    let password = reqData.password;
    let email = reqData.email;

    var hash = crypto.createHash('sha512');
    var salt = '' + Math.floor(Math.random() * 100000000);
    var toHash = password + salt;
    data = hash.update(toHash, 'utf-8');
    gen_hash = data.digest('hex');


    Student.find({ email: email }).exec(function(err, results) {
        if (err) {
            res.end("Account already associated with email!")
        } else if (results.length == 0) {
            var newStudent = new Student({
                _id: new mongoose.Types.ObjectId(),
                name: name,
                email: email,
                salt: salt,
                hash: gen_hash,
            });
            newStudent.save(
                function(err) {
                    if (err) { return res.end("Error student user not made/not saved") }
                    res.end('User created!');
                });
        }
    })
})

app.get('/account/get/students', async(req, res) => {
    Student.find()
        .exec(function(err, results) {
            if (err) return handleError(err);
            res.end(JSON.stringify(results));
        })
})

app.get('/account/get/teachers', async(req, res) => {
    Teacher.find()
        .exec(function(err, results) {
            if (err) return handleError(err);
            res.end(JSON.stringify(results));
        })
})

app.get('/account/get/messages', async(req, res) => {
    Message.find()
        .exec(function(err, results) {
            if (err) return handleError(err);
            res.end(JSON.stringify(results));
        })
})

app.get('/account/get/classes', async(req, res) => {
    Class.find()
        .exec(function(err, results) {
            if (err) return handleError(err);
            res.end(JSON.stringify(results));
        })
})

app.get('/account/student/login/:email/:password', async(req, res) => {
    let email = req.params.email;
    let password = req.params.password;
    Student.findOne({ email: email })
        .exec(function(err, results) {
            if (err) { res.end("user does not exist") } else if (results && results.salt) {
                var hash = crypto.createHash('sha512');
                var toHash = password + results.salt;
                data = hash.update(toHash, 'utf-8');
                gen_hash = data.digest('hex');
                var correct = gen_hash == results.hash;

                if (correct) {
                    var sessionKey = putSession(results._id);
                    res.cookie("login", { user: results, key: sessionKey }, { maxAge: TIMEOUT });
                    res.end('SUCCESS');
                } else { res.end('FAIL') }
            } else {
                res.end('FAIL');
            }
        })
})

app.post('/account/teacher/create', async(req, res) => {
    console.log('Teacher account being created');
    let reqData = req.body;
    let name = reqData.name;
    let password = reqData.password;
    let email = reqData.email;

    var hash = crypto.createHash('sha512');
    var salt = '' + Math.floor(Math.random() * 100000000);
    var toHash = password + salt;
    data = hash.update(toHash, 'utf-8');
    gen_hash = data.digest('hex');

    Teacher.find({ email: email })
        .exec(function(err, results) {
            if (err) {
                res.end("Email already associated with an account!")
            } else if (results.length == 0) {
                var newTeacher = new Teacher({
                    _id: new mongoose.Types.ObjectId(),
                    name: name,
                    email: email,
                    salt: salt,
                    hash: gen_hash,
                });
                newTeacher.save(
                    function(err) {
                        if (err) { return res.end('FAIL') }
                        res.end('SUCCESS');
                    });
            }
        })
})

app.get('/account/teacher/login/:email/:password', async(req, res) => {
    let email = req.params.email;
    let password = req.params.password;

    Teacher.findOne({ email: email })
        .exec(function(err, results) {
            if (err) { res.end("user does not exist") } else if (results && results.salt) {
                var hash = crypto.createHash('sha512');
                var toHash = password + results.salt;
                data = hash.update(toHash, 'utf-8');
                gen_hash = data.digest('hex');
                var correct = gen_hash == results.hash;

                if (correct) {
                    var sessionKey = putSession(results._id);
                    res.cookie("login", { user: results, key: sessionKey }, { maxAge: TIMEOUT });
                    res.end('SUCCESS');
                } else { res.end('FAIL') }
            } else {
                res.end('FAIL');
            }
        })
})

app.get('/account/signout/:userID', (req, res) => {
    delete sessions[req.params.userID];
    res.end('/index.html');
})

app.get('/account/course/:courseID', (req, res) => {
    Class.findOne({ _id: req.params.courseID })
        .populate('students')
        .populate('messages')
        .lean()
        .exec(function(err, result) {
            if (err) {
                res.end("FAIL");
            } else {
                res.end(JSON.stringify(result));
            }
        })
})

//App ///

/*
    Posts
*/

app.post('/app/student/class/join', async(req, res) => {
    let studentID = req.cookies.login.user._id;
    let reqData = req.body;
    let courseID = reqData.courseID;

    addStudentToClass(courseID, studentID, function(err, response) {
        if (err) {
            res.end('FAIL');
        } else {
            addClassToStudent(courseID, studentID, function(err, response) {
                if (err) res.end('FAIL');
                res.end('/student-homepage.html');
            })
        }
    })
})

app.post('/app/teacher/class/create', async(req, res) => {
    let teacher = req.cookies.login.user;
    let requestData = req.body;
    let requestclassName = requestData.name;
    let requestSemesterName = requestData.semester;
    let requestDescription = requestData.description;

    Class.find({ name: requestclassName })
        .exec(function(err, results) {
            if (err) {
                res.end("Class exists!")
            } else if (results.length == 0) {
                var newClass = new Class({
                    _id: new mongoose.Types.ObjectId(),
                    name: requestclassName,
                    teacher: teacher._id,
                    messages: [],
                    sessions: [],
                    active: false,
                    semestername: requestSemesterName,
                    description: requestDescription
                });
                newClass.save(
                    function(err, newClass) {
                        if (err) {
                            return res.end("Error class not made/not saved")
                        }
                        Teacher.findOne({ _id: teacher._id })
                            .exec(function(err, result) {
                                if (err) { res.end('error') }
                                result.classes.push(newClass._id)
                                result.save(function(err) {
                                    if (err) return res.end('FAIL');
                                    else { res.end('SUCCESS!'); }
                                });
                            });
                        res.end(newClass._id.toString());
                    });
            }
        })
})

/*
    Gets
*/

app.get('/app/teacher/classes/:teacherID', async(req, res) => {
    var teacherID = req.params.teacherID;

    Teacher.findOne({ _id: teacherID })
        .populate('classes')
        .exec(function(err, teacher) {
            if (err) {
                res.end('FAIL');
            }
            res.end(JSON.stringify(teacher))
        })

})

app.get('/app/student/classes/:studentID', async(req, res) => {
    var studentID = req.params.studentID;

    Student.findOne({ _id: studentID })
        .populate('classes')
        .exec(function(err, student) {
            if (err) {
                res.end('FAIL');
            }
            res.end(JSON.stringify(student))
        })
})


app.get('/app/:class/start', async(req, res) => {
    console.log('start class');
    const currClass = req.params.class;

    Class.findOne({ _id: currClass })
        .exec(function(err, result) {
            if (err) { res.end('FAIL') }
            result.active = true;
            result.save()
            startClassSession(result, function(err, classSession) {
                if (err) {
                    res.end('FAIL');
                }
                res.cookie("session", { session: classSession }, { maxAge: TIMEOUT });;
                res.end('SUCCESS');
            });
        })
})

app.get('/app/:class/stop', async(req, res) => {
    console.log('stop class');
    const currClass = req.params.class;
    let currSession = req.cookies.session.session;
    let user = req.cookies.login.user;

    Class.findOne({ _id: currClass })
        .exec(function(err, result) {

            if (err) { res.end('FAIL') }
            result.active = false;
            result.save()
            stopClassSession(user, currSession, function(err) {
                if (err) { res.end('FAIL'); }
                res.end('SUCCESS');
            })
        })
})

app.get('/clear/database', async(req, res) => {
    Student.deleteMany({})
        .exec(function(err, results) {})
    Teacher.deleteMany({})
        .exec(function(err, results) {})

    Class.deleteMany({})
        .exec(function(err, results) {})

    Message.deleteMany({})
        .exec(function(err, results) {})

    res.end("database cleared.")

})

app.get('/app/:class/message/:type', async(req, res) => {
    const session = req.cookies.session.session;
    let user = req.cookies.login.user;
    let currClass = req.params.class;
    let mesasgeType = req.params.type;

    let builtMessage = buildMessage(mesasgeType, user.name);
    let timeStamp = getTimeStamp();

    var newMessage = new Message({
        _id: new mongoose.Types.ObjectId(),
        time: timeStamp,
        mesasge: builtMessage,
        student: user,
        class: currClass
    })

    Class.findOne({ _id: currClass })
        .exec(function(err, result) {
            console.log(result);
            if (err) {
                res.end('FAIL');
            }
            if (result.active == true) {
                newMessage.save()
                addMessageToClass(currClass, newMessage._id, function(err, response) {
                    console.log('added to class');
                    if (err) { res.end('FAIL'); }
                })
                addMessageToSession(session._id, newMessage._id, function(err, response) {
                    console.log('added to session');
                    if (err) { res.end('FAIL'); }
                })
            } else {
                res.end('NOT ACTIVE')
            }
        })
})

function addClassToStudent(classID, studentID, _callback) {
    Student.updateOne({ _id: studentID }, { $push: { classes: classID } },
        function(err, response) {
            _callback(err, response);
        }
    )
}

function addStudentToClass(classID, studentID, _callback) {
    Class.updateOne({ _id: classID }, { $push: { students: studentID } },
        function(err, response) {
            _callback(err, response);
        }
    )
}

function addSessionToClass(classID, sessionID, _callback) {
    Class.updateOne({ _id: classID }, { $push: { sessions: sessionID } },
        function(err, response) {
            _callback(err, response);
        }
    )
}

function addMessageToClass(classID, messageID, _callback) {
    Class.updateOne({ _id: classID }, { $push: { messages: messageID } },
        function(err, response) {
            _callback(err, response);
        }
    )
}

function addMessageToSession(sessionID, messageID, _callback) {
    Session.updateOne({ _id: sessionID }, { $push: { messages: messageID } },
        function(err, response) {
            _callback(err, response);
        }
    )
}



/////////
//Start//
/////////

app.listen(80, () => {
    console.log("Server running on localhost 8000");
});
