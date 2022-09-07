const express = require('express');
const path = require('path');  
const cors = require('cors');
var bodyparser=require('body-parser');
const jwt = require('jsonwebtoken');
const UserData = require('./src/model/userData');
const TimesheetData = require('./src/model/timesheetData');
const ProgramConfigData = require('./src/model/programconfigData');

const PORT =  3000;

var app = new express();
// app.use(express.static('./dist/frontend'));
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(bodyparser.json());

app.get("/", (req, res) => {
  res.send("welcome");
});

// function verifyToken(req, res, next) {
//     if(!req.headers.authorization) {
//       return res.status(401).send('Unauthorized request')
//     }
//     let token = req.headers.authorization.split(' ')[1]
//     if(token === 'null') {
//       return res.status(401).send('Unauthorized request')    
//     }
//     let payload = jwt.verify(token, 'secretKey')
//     if(!payload) {
//       return res.status(401).send('Unauthorized request')    
//     }
//     req.userId = payload.subject
//     next()
//   }


  
// ................................................SIGNUP.........................................
  app.post('/api/signup',function(req,res){
   
    var userdata = {       
      firstname : req.body.userdata.firstname,
      lastname : req.body.userdata.lastname,
      email : req.body.userdata.email,
      password : req.body.userdata.password,
      trainer_type : req.body.userdata.trainer_type,
      role : 'trainer' 

   }       
   UserData.find()     
        .then(function (user) {
            for(let i=0;i<user.length;i++){        
                if(userdata.email==user[i].email){
                    flag=true;
                    break;
                }
                else{
                    flag=false;
                }
            }
            if(flag){
                res.status(401).send({status:'Username already exist!'});
            }
            else{
                var user = new UserData(userdata);
                user.save();
                res.status(200).send({status:'Registration completed successfully'});
            }
        });  
});

// ................................................LOGIN..........................................
  app.post('/api/login', (req, res) => {
    let userData = req.body
    console.log(userData);
    var flag=false;
    var userFrontendpass='';
    
        UserData.find()     
        .then(function (user) {
            for(let i=0;i<user.length;i++){        
                if(userData.email_id==user[i].email && userData.pswd==user[i].password){
                    flag=true;
                    userFrontendpass=user[i];
                    break;
                }
                else{
                    flag=false;
                }
            }
            if(flag==true){
              let payload = {subject: userData.email_id+userData.pswd}
              let token = jwt.sign(payload, 'secretKey')
              res.status(200).send({token,userFrontendpass});
          
            }
            else{
              res.status(401).send('Invalid UserName or Password');
            }
        });  
    })


    // .....................................ADD TIMESHEET ENTRY..........................................
    app.post('/api/insertTimesheet',function(req,res){
   
      var timesheetData= {       
          date : req.body.timesheet.date,
          program_name: req.body.timesheet.program_name,
          training_mode: req.body.timesheet.training_mode,
          activity : req.body.timesheet.activity,
          hours: req.body.timesheet.hours,
          students:0,
          user_id: '',
          status: 'pending'
         
     } 
     ProgramConfigData.find({ programme_name: timesheetData.program_name})   
    .then((students_count)=> {
      console.log("students",students_count[0].no_of_students);
      let a=parseInt(students_count[0].no_of_students);
      timesheetData.students=a;
      console.log("std2",timesheetData.students);
    }).catch((err)=> {
      console.log('error ', err.message);
    })  

     var t_sheet = new TimesheetData(timesheetData);
     console.log("t_sheet",t_sheet)
     t_sheet.save();
  });

  // ....................................VIEW TIMESHEET LIST.............................................
  app.get('/api/timesheetList',function(req,res){
    
    TimesheetData.find()
                .then(function(timesheetdata){
                    res.send(timesheetdata);
                });
  });
  
//  .............................GET DATA FROM PROGRAM CONFIGURATION DB................................


app.post('/api/pgmbydate', (req, res) => {
  console.log("pgm_by_date", req.body);
  let date_data = req.body.date;
  console.log('date', date_data);
 
  
  ProgramConfigData.find({start_date: date_data})   
    .then((programconfgdata)=> {
      console.log(programconfgdata);

      res.status(200).send({programconfgdata})
    }).catch((err)=> {
      console.log('error while fetching program by date', err.message);
    })  
      // .then(function (date) {
      //     for(let i=0;i<date.length;i++){
      //       let d =new Date(date[i].start_date)
      //       let programDate = `${(d.getFullYear().toString())}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`
      //       console.log(programDate);        
      //         if(programDate==date_data){
      //             flag=true;
            
      //             break;
      //         }
      //         else{
      //             flag=false;
      //         }
      //     }
      //     if(flag==true){
      //       console.log("date found");
      //     }
      //     else{
      //       console.log("date not found");
      //     }
      // });  
  });









// app.get('/api/get_pgm_by_date:date',function(req,res){
//   const date = req.params.date;
//   ProgramConfigData.find()
//               .then(function(programdata){
//                   pgm_data=programdata.programme_name
//                 console.log("programdata",pgm_data);
//                   // res.send(pgm_data);
//               });
// });




// app.get('/',  (req, res) => {
  
//   // const date = req.params.date;
//   // console.log("req date",date);
//   ProgramConfigData.find()
//     .then((programdata)=>{
//         res.send(programdata);
//         console.log(programdata);
//     });
// })
// .................GET TIMESHEET OF PARTICULAR ID.....................................
// app.get('/api/getTimesheetListbyId:id',  (req, res) => {
  
//   const id = req.params.id;
//   TimesheetData.findOne({"_id":id})
//     .then((t_sheet)=>{
//         res.send(t_sheet);
//     });
// })

// app.get('/api/:id',  (req, res) => {
//   const id = req.params.id;
//   console.log("req id",id);
//   TimesheetData.findOne({"_id":id})
//   .then((timesheetdata)=>{
  
//       res.send(timesheetdata);
//   });
// });

//............................... ......UPDATE TIMESHEET..........................................
// app.put('/api//updateTimesheet',(req,res)=>{
//       console.log("timesheet data from front",req.body);
//   id=req.body._id,
//   date = req.body.date,
//   program_name = req.body.program_name,
//   training_mode = req.body. training_mode,
//   activity = req.body.activity,
//   hours = req.body.hours,

//   TimesheetData.findByIdAndUpdate({"_id":id},
//                              {$set:{"date": date,
//                              "program_name": program_name,
//                              "training_mode": training_mode,
//                              "activity": activity,
//                              "hours": hours
//                             }})
// .then(function(){
//     res.send();
// })
// })


  //  app.get('/*', function(req, res) {
  //   res.sendFile(path.join(__dirname + '/dist/frontend/index.html'));
  //  });

app.listen(PORT,()=>{
    console.log(`Server Ready on ${PORT}`);   
});


