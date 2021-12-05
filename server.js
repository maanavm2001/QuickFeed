/////////////
///Server ///
// Setup ////
/////////////

const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

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

// User authenticate
function authenticate(req, res, next) {
    if (Object.keys(req.cookies).length > 0) {
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

function buildMessage(code, timeStamp) {
    finalstring = ''

    /// TODO:
    /// Decipher code

    /// Turn timestamp to str

    /// build/concatenate final string

    return finalstring;
}

function getTimeStamp() {
    return toHMS(currTime)
}

function stopClassSession() {
    //TODO: compile email data and send


    currTime = 0;
}

function secondUp() {
    currTime++
}

function startClassSession(currClass, req) {
    currTime++;
    var d = new Date();
    var NoTimeDate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
    sessionClass = Class.find({ classname: currClass }).exec(function(err, res) {
        if (err) { res.end('Error class may not exist.') }
    });
    var classSession = new Session({
        active: true,
        date: NoTimeDate,
        class: sessionClass._id,
    });

    classSession.save().exec(function(err, res) {
        if (err) { res.end("Could not save session") }
        sessionClass.sessions.push(res._id)
        sessionClass.save().exec(function(err) { if (err) { res.end('error') } })
        req.cookies.session = res._id

    });
    setInterval(secondUp, 1000)
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
                } else { res.end("wrong password") }
            } else {
                res.end('There was an issue logging in please try again');
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
                        if (err) { return res.end("Error teacher user not made/not saved") }
                        res.end('Teacher created!');
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
                } else { res.end("wrong password") }
            } else {
                res.end('There was an issue logging in please try again');
            }
        })
})

app.get('/account/signout/:userID', (req, res) => {
    delete sessions[req.params.userID];
    res.end('/index.html');
})

app.get('/account/course/:courseID', (req, res) => {
    console.log(req.params);
    Class.findOne({ _id: req.params.courseID })
    .exec(function(err, result) {
        if (err) {
            console.log(err);
            res.end("FAIL");
        } else {
            console.log(result);
            res.end(JSON.stringify(result));
        }
    })
})

//App ///

/*
    Posts
*/

app.post('/app/student/class/join', async(req, res) => {
    console.log('here');
    let studentID = req.cookies.login.user._id;
    let reqData = req.body;
    let courseID = reqData.courseID;

    addStudentToClass(courseID, studentID, function(err, response) {
        if (err) {
            res.end('FAIL');
        } else {
            addClassToStudent(courseID, studentID, function(err, response) {
                if (err) res.end('FAIL');
                console.log('here2');
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
                    console.log(newClass._id);
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
    const currClass = req.params.class;

    startClass = Class.find({ classname: currClass }).exec(function(err, res) {
        if (err) { res.end('Error class may not exist.') }
    });
    startClass.active = true;
    startClass.save().exec(function(err) { if (err) { res.end("Couldn't start") } });

    startClassSession(currClass, req)
    res.end('Class started')
})

app.get('/app/:class/stop', async(req, res) => {
    const currClass = req.params.class;

    startClass = Class.find({ classname: currClass }).exec(function(err, res) {
        if (err) { res.end('Error class may not exist.') }
    });
    startClass.active = false;
    startClass.save().exec(function(err) { if (err) { res.end("Couldn't end") } });

    stopClassSession()
    res.end('Class ended')
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

app.get('/app/class/:type', async(req, res) => {
    const session = req.cookies.session;
    let u = req.cookies.login.username;
    currSession = Session.find({ _id: session })
    currClass = currSession.class;
    Class.find({ classname: currClass }).exec(function(err, res) {
        if (err) { res.send('error') } else if (res.active) {
            const mesasgeType = req.params.type;
            const timeStamp = getTimeStamp();

            let builtMessage = decipherMessage(mesasgeType, timeStamp);

            var newMessage = new Message({
                time: timeStamp,
                mesasge: builtMessage,
                student: u,
                class: currClass
            })

            newMessage.save().exec(function(newMesssage, err) {
                if (err) { res.end('error') }
                Class.find({ classname: res.class }).exec(function(err, results) {
                    if (err) {
                        res.end("error")
                    }
                    results.mesasges.push(newMesssage._id)
                    results.save().exec(function(err) { if (err) { res.end('error') } })
                })
                Student.find({ username: res.student }).exec(function(err, results) {
                    if (err) {
                        res.end("error")
                    }
                    results.mesasges.push(newMesssage._id)
                    results.save().exec(function(err) { if (err) { res.end('error') } })
                })
                currSession.mesasges.push(newMessage._id);
                currSession.save().exec(function(err) { if (err) { res.end('error') } })
            })
        } else { res.end('class not active') }
    })
})

function addClassToStudent(classID, studentID, _callback) {
    Student.updateOne(
        { _id: studentID },
        { $push: {classes: classID}},
        function (err, response) {
            _callback(err, response);
        }
    )
}

function addStudentToClass(classID, studentID, _callback) {
    Class.updateOne(
        { _id: classID },
        { $push: {students: studentID}},
        function (err, response) {
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