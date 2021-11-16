/////////////
///Server ///
// Setup ////
/////////////

const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser')
const cookieParser = require('cookie-parser');

const app = express();

app.use(parser.text({type: '*/*'}));
app.use(cookieParser());

app.use(express.static('public_html'))
app.use(express.json());

mongoose.connect("mongodb+srv://modim:Maanavgt21@cluster0.d4bou.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

import { resolveSoa } from 'dns';
///////////
//Code/////
//Imports//
//Func.////
///////////

// Models from model.js
import { Student, Teacher, Message, Class } from '/models.js'

function buildMessage(code, timeStamp) {
    finalstring = ''

    /// TODO:
    /// Decipher code

    /// Turn timestamp to str

    /// build/concatenate final string

    return finalstring;
}

///////////
//Routes///
///////////


app.post('/account/student/create/', async (req,res)=>{
    let requestData = JSON.parse(JSON.stringify(req.body));
    let requestuserName = requestData.username;
    let requestStudentName = requestData.studentname
    let requestPassword = requestData.password;

    Student.find({username: requestuserName}).exec( function (err, results){
        if(err){
            res.end("Username taken!")
        }   
        else if(results.length == 0){
            var newStudent = new Student({ 
                username: requestuserName,
                studentname: requestStudentName,
                password: requestPassword,
            });
            newUser.save(
                function(err){
                    if (err){return res.end("Error student user not made/not saved")}
                    res.end('User created!');
            });
        }
    })  
})

app.post('/account/teacher/create/', async (req,res)=>{
    let requestData = JSON.parse(JSON.stringify(req.body));
    let requestuserName = requestData.username;
    let requestTeacherName = requestData.teachername
    let requestPassword = requestData.password;

    Teacher.find({username: requestuserName}).exec( function (err, results){
        if(err){
            res.end("Username taken!")
        }   
        else if(results.length == 0){
            var newTeacher = new Teacher({ 
                username: requestuserName,
                teachername: requestTeacherName,
                password: requestPassword,
            });
            newTeacher.save(
                function(err){
                    if (err){return res.end("Error teacher user not made/not saved")}
                    res.end('User created!');
            });
        }
    })  
})

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
                length: requestLength,
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

app.get('/app/:class/:type', async (req,res)=>{
    const currClass = req.params.class;
    const mesasgeType = req.params.type;

    // TODO:
    // need to figure out how to do minuts into a class not current time
    const timeStamp = Date.now();

    let builtMessage = decipherMessage(mesasgeType, timeStamp);

    var newMessage = new Message({
        time: timeStamp,
        mesasge: builtMessage,
        student: student, //TODO: use cookies to make it the current user
        class: currClass
    })

    newMessage.save().exec(function (messsage, err){
        if(err){res.end('error')}
        Class.find({classname: res.class}).exec( function (err, results){
            if(err){
                res.end("error")
            }   
            results.mesasges.push(message._id)
            results.save().exec(function (err){if (err) {res.end('error')}})
        }) 
        Student.find({username: res.student}).exec( function (err, results){
            if(err){
                res.end("error")
            }   
            results.mesasges.push(message._id)
            results.save().exec(function (err){if (err) {res.end('error')}})
        }) 
    }) 
})


/////////
//Start//
/////////

app.listen(8000, () => {
    console.log("Server running on localhost 8000");
});
