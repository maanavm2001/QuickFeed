/////////////
///Server ///
// Setup ////
/////////////

const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

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
    sessions[username] = {'key': sessionKey, 'time': Date.now()};
    return sessionKey;
  } else {
    let sessionKey = Math.floor(Math.random() * 1000);
    sessions[username] = {'key': sessionKey, 'time': Date.now()};
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


mongoose.connect(mongoDBURL, {useNewUrlParser: true})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
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

var currTime = 0;
var ClassLengthSec = 0;

// User authenticate
function authenticate(req, res, next) {
    if (Object.keys(req.cookies).length > 0) {
      let u = req.cookies.login.username;
      let key = req.cookies.login.key;
      if (isValidSession(u, key)) {
        putSession(u, key);
        res.cookie("login", {username: u, key:key}, {maxAge: TIMEOUT});
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

function getTimeStamp(){
    return toHMS(currTime)
}

function stopClassSession(){
    //TODO: compile email data and send


    currTime = 0;
    ClassLengthSec = 0;
}

function startClassSession(){
    if(currTime == ClassLengthSec){
        stopClassSession()
    }
    currTime++;
    setInterval(startClassSession, 1000)
}

///////////
//Routes///
///////////


//Account creation/login ////

app.post('/account/student/create', async (req,res) => {
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


    Student.find({email: email}).exec( function (err, results){
        if(err){
            res.end("Account already associated with email!")
        }   
        else if(results.length == 0){
            var newStudent = new Student({ 
                name: name,
                email: email,
                salt: salt,
                hash: gen_hash,
            });
            newStudent.save(
                function(err){
                    if (err){return res.end("Error student user not made/not saved")}
                    res.end('User created!');
            });
        }
    })  
})

app.get('/account/get/students', async (req, res) => {
    Student.find()
        .exec(function (err, results) {
            if (err) return handleError(err);
            res.end(JSON.stringify(results));
        })
})

app.get('/account/get/teachers', async (req, res) => {
    Teacher.find()
        .exec(function (err, results) {
            if (err) return handleError(err);
            res.end(JSON.stringify(results));
        })
})

app.get('/account/student/login/:email/:password', async (req, res) => {
    let email = req.params.email;
    let password = req.params.password;
    Student.findOne({email: email})
    .exec( function (err, results) {
        if (err){res.end("user does not exist")}
        
        else if (results && results.salt) {
            var hash = crypto.createHash('sha512');
            var toHash = password + results.salt;
            data = hash.update(toHash, 'utf-8');
            gen_hash = data.digest('hex');
            var correct = gen_hash == results.hash;

            if(correct){
                var sessionKey = putSession(results.email);
                res.cookie("login", {name: results.name, key:sessionKey}, {maxAge: TIMEOUT});
                res.end('SUCCESS');
            }
            else{res.end("wrong password")}
        } else {
            res.end('There was an issue logging in please try again');
        }
    })
})

app.post('/account/teacher/create', async (req,res) => {
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

    Teacher.find({email: email})
    .exec( function (err, results){
        if(err){
            res.end("Email already associated with an account!")
        }   
        else if(results.length == 0){
            var newTeacher = new Teacher({ 
                name: name,
                email: email,
                salt: salt,
                hash: gen_hash,
            });
            newTeacher.save(
                function(err){
                    if (err){return res.end("Error teacher user not made/not saved")}
                    res.end('Teacher created!');
            });
        }
    })  
})

app.get('/account/teacher/login/:email/:password', async (req, res)=> {
    let email = req.params.email;
    let password = req.params.password;

    Teacher.findOne({email: email})
    .exec( function (err, results){
        if (err){res.end("user does not exist")}
        else if (results && results.salt) {
            var hash = crypto.createHash('sha512');
            var toHash = password + results.salt;
            data = hash.update(toHash, 'utf-8');
            gen_hash = data.digest('hex');
            var correct = gen_hash == results.hash;

            if(correct){
                var sessionKey = putSession(results.email);
                res.cookie("login", {name: results.name, key:sessionKey}, {maxAge: TIMEOUT});
                res.end('SUCCESS');
            }
            else{res.end("wrong password")}
        } else {
            res.end('There was an issue logging in please try again');
        }
    })
})

//App ///

/*
    Posts
*/

app.post('/app/teacher/class/create/', async (req,res)=>{
    let requestData = JSON.parse(JSON.stringify(req.body));
    let requestclassName = requestData.classname;
    let requestTeacherName = requestData.teachername
    let requestLength = requestData.length;
    let requestStudents = requestData.students;

    Class.find({classname: requestclassName}).exec( function (err, results){
        if(err){
            res.end("Class exists!")
        }   
        else if(results.length == 0){
            var newClass = new Class({ 
                classname: requestclassName,
                teachername: requestTeacherName,
                classlength: requestLength,
                students: requestStudents
            });

            newClass.save(
                function(newClass, err){
                    if (err){return res.end("Error class not made/not saved")}
                    Teacher.find({teachername: newClass.resteachername}).exec( function (err, results){
                        if(err){res.end('error')}
                        results.classes.push(newClass._id)
                        result.save(function (err) { 
                            if (err) return res.end('FAIL'); 
                            else { res.end('SUCCESS!'); }
                        });
                    });
                res.end('Class created!');
            });
        }
    })  
})

/*
    Gets
*/

app.get('/app/:class/start', async (req,res) => {
    const currClass = req.params.class;
   
    startClass = Class.find({classname: currClass}).exec(function (err, res) {
        if(err){res.end('Error class may not exist.')}
    });
    startClass.active = true;
    ClassLengthSec = startClass.classlength * 60;
    startClass.save().exec(function (err){if(err){res.end("Couldn't start")}});

    startClassSession()
    res.end('Class started')
})

app.get('/app/:class/stop', async (req,res) => {
    const currClass = req.params.class;
   
    startClass = Class.find({classname: currClass}).exec(function (err, res) {
        if(err){res.end('Error class may not exist.')}
    });
    startClass.active = false;
    startClass.save().exec(function (err){if(err){res.end("Couldn't end")}});

    stopClassSession()
    res.end('Class ended')
})

app.get('/app/:class/:type', async (req,res)=>{
    const currClass = req.params.class;
    let u = req.cookies.login.username;

    Class.find({classname: currClass}).exec(function (err, res) {
        if (err) {res.send('error')}
        else if(res.active){
            const mesasgeType = req.params.type;
            const timeStamp = getTimeStamp();

            let builtMessage = decipherMessage(mesasgeType, timeStamp);

            var newMessage = new Message({
                time: timeStamp,
                mesasge: builtMessage,
                student: u,
                class: currClass
            })

            newMessage.save().exec(function (newMesssage, err){
                if(err){res.end('error')}
                Class.find({classname: res.class}).exec( function (err, results){
                    if(err){
                        res.end("error")
                    }   
                    results.mesasges.push(newMesssage._id)
                    results.save().exec(function (err){if (err) {res.end('error')}})
                }) 
                Student.find({username: res.student}).exec( function (err, results){
                    if(err){
                        res.end("error")
                    }   
                    results.mesasges.push(newMesssage._id)
                    results.save().exec(function (err){if (err) {res.end('error')}})
                }) 
            }) 
        }
        else {res.end('class not active')}
    })
})

/////////
//Start//
/////////

app.listen(80, () => {
    console.log("Server running on localhost 8000");
});