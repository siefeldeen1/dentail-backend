const express = require('express')
const app = express ()
const mysql = require("mysql")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const bodyParser = require('body-parser');  
const urlencodedParser = bodyParser.urlencoded({ extended: false })  
const saltsRounds = 10
const PORT = 3001
const passport = require('passport')
const FacebookStrategy = require("passport-facebook").Strategy
require("dotenv").config();
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const passportSetup = require("./passport");

const dummy = require('./dummy.json')
const dummy2 = require('./dummy2.json')


app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(cors())
app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(passport.initialize());
app.use(passport.session());
// const connection = mysql.createPool({
//     host:"aws-eu-west-2.connect.psdb.cloud",
//     user:"m75jecg6xa68oswmo9lr  ",
//     password:"pscale_pw_u2qNamIp6LGUrr8B4Ekc85vILdtUUB1Px1gzRslsubb",
//     database:"login_db"
// })
// const connection = mysql.createPool({
//     host:"aws-eu-west-2.connect.psdb.cloud",
//     user:"5md95ivkiw85id6l0bau",
//     password:"pscale_pw_TGZSa8SSGRElvxRB6jQgakzpiwpyRpoPwY7Jlk0VIx",
//     database:"login_db"
// })

app.use("/auth", authRoute);

const connection = mysql.createPool('mysql://5md95ivkiw85id6l0bau:pscale_pw_TGZSa8SSGRElvxRB6jQgakzpiwpyRpoPwY7Jlk0VIx@aws-eu-west-2.connect.psdb.cloud/dentist?ssl={"rejectUnauthorized":true}')
// const connection = mysql.createPool('mysql://m75jecg6xa68oswmo9lr:pscale_pw_u2qNamIp6LGUrr8B4Ekc85vILdtUUB1Px1gzRslsubb@aws-eu-west-2.connect.psdb.cloud/login-data?ssl={"rejectUnauthorized":true}')

// passport.use(new FacebookStrategy({
//   clientID: process.env.FB_ID_KEY,
//   clientSecret:process.env.FB_SECRET_KEY ,
//   callbackURL: "http://localhost:3000/auth/facebook/app"
// },
// function(accessToken, refreshToken, profile, cb) {
//   User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//     return cb(err, user);
//   });
// }
// ));





app.post('/signup',(req,res)=>{
    const username = req.body.username
    const password = req.body.password
  
    const sql = "SELECT * FROM `login-data`.login WHERE Email = ?"
  
    connection.query(sql,[username],(err,data)=>{
  
      if(err){
        console.log(err);
        res.status(500).send(err)
      }

      if(data){

              if(data.length == 1){
        res.status(401).json({message:"User already exists"})
      }else{
    
        const sql = "INSERT INTO login (Email,password) VALUES (?,?)"

        bcrypt.genSalt(saltsRounds, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
            connection.query(sql,[username,hash],(err,data)=>{
              if(err){
                console.log(err);
                res.status(500).send(err)
              }
      
              if(data){
                res.json({message:"user added"})
              }
              
      
            })
      
           });
        });
        
      }

      }
     

  
  
    })
})


app.post('/patient_details',(req,res)=>{

  const Name = req.body.Name
  const last_name = req.body.last_name
  const email = req.body.email
  const phone = req.body.phone
  const country = req.body.country
  const address = req.body.address
  const state = req.body.state
  const city = req.body.city
  const zip_code = req.body.zip_code
  const birth = req.body.birth
  const emergency  = req.body.emergency 
  const preference = req.body.preference
  const gender = req.body.gender
  const guardian = req.body.guardian
  const patient_id  = req.body.patient_id 
  const notes  = req.body.notes 

  console.log(Date);

  const sql = "INSERT INTO  dentist.patient_detials (`name`,`last_name`,`email`,`phone`,`country`,`state`,`city`,`zip_code`,`address`,`birth_date`,`emergency_contact`,`preference`,`gender`,`guardian`,`patient_id`,`notes`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  connection.query(sql,[Name,last_name,email,phone,country,state,city,zip_code,address,birth,emergency,preference,gender,guardian,patient_id,notes],(err,data)=>{
    if(err){
      console.log(err);
      res.status(500).send(err)
    }

    if(data){
      res.json({message:"user added"})
    }
    

  })
})




app.post('/login',(req,res)=>{
  const username = req.body.username
  const password = req.body.password

  const sql = "SELECT * FROM `login-data`.login WHERE Email = ? AND password = ?"

  connection.query(sql,[username,password],(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    }

    if(data.length == 1){
        res.status(200).json({message:"a7a"})
        console.log("success");
    }else{
      res.status(401).json({message:"Email or password wrong"})
    }
  })
})

app.post('/insert',(req,res)=>{
  const Date = req.body.Date
  const Patient_Name = req.body.Patient_Name
  const Practice = req.body.Practice
  const Lab = req.body.Lab
  const Doctor = req.body.Doctor
  const Radiologist  = req.body.Radiologist 

  console.log(Date);

  const sql = "INSERT INTO dentist.form_det (`date`,`patient`,`practice`,`Lab`,`Doctor`,`Radiologist`) VALUES (?,?,?,?,?,?)"
  connection.query(sql,[Date,Patient_Name,Practice,Lab,Doctor,Radiologist],(err,data)=>{
    if(err){
      console.log(err);
      res.status(500).send(err)
    }

    if(data){
      res.json({message:"user added"})
    }
    

  })
})


app.get('/Search',(req,res)=>{

  const name = req.headers.name
  const last_name = req.headers.last_name
  const phone = req.headers.phone
  const birth = req.headers.birth

  // console.log(name,last_name,phone,birth);
  const sql =  `SELECT * FROM dentist.patient_detials WHERE name LIKE '${name}%' AND phone LIKE '${phone}%' AND last_name LIKE '${last_name}%' AND birth_date LIKE '${birth}%'  `
  // const sql =  "SELECT * FROM dentist.patient_detials WHERE name LIKE"+ ` '%${name}%' or phone LIKE '%${phone}%' or last_name LIKE '%${last_name}%' or birth_date LIKE '%${birth}%'  `

    console.log(sql);

  connection.query(sql,(err,data)=>{
   if(err){
       console.log(err);
       // res.send(err)
   }
 
   if(data){
    console.log("data",data);
       if(data.length > 0){
           res.send(data)
       }else{
        res.send([{}])
       }
   }
 })

})


app.get('/delete',(req,res)=>{
  const name = req.headers.name
  const last_name = req.headers.last_name
  const phone = req.headers.phone
  const birth = req.headers.birth

  const sql =  `DELETE FROM dentist.patient_detials WHERE name LIKE '${name}%' AND phone LIKE '${phone}%' AND last_name LIKE '${last_name}%' AND birth_date LIKE '${birth}%'  `

  connection.query(sql,(err,data)=>{
    if(err){
        console.log(err);
        // res.send(err)
    }
  
    if(data){
     console.log("data",data);
        if(data){
          res.status(200).json({message:"deleted"})
        }
    }
  })
})

app.get('/find',(req,res)=>{
  const search_name = req.headers.search_name

//  const sql =  "SELECT * FROM dentist.form_det WHERE date LIKE `%${search_name}%` or patient LIKE `%${search_name}%' or practice LIKE `%${search_name}%'"
 
 const sql =  "SELECT * FROM dentist.form_det WHERE date LIKE"+ ` '%${search_name}%' or patient LIKE '%${search_name}%' or practice LIKE '%${search_name}%'  `
 
 connection.query(sql,(err,data)=>{
  if(err){
      console.log(err);
      // res.send(err)
  }

  if(data){
      if(data.length > 0){
          res.send(data)
      }
  }
})
})

app.put('/update',(req,res)=>{
  const Name = req.body.Name
  const last_name = req.body.last_name
  const email = req.body.email
  const phone = req.body.phone
  const country = req.body.country
  const address = req.body.address
  const state = req.body.state
  const city = req.body.city
  const zip_code = req.body.zip_code
  const birth = req.body.birth
  const emergency  = req.body.emergency 
  const preference = req.body.preference
  const gender = req.body.gender
  const guardian = req.body.guardian
  const patient_id  = req.body.patient_id 
  const notes  = req.body.notes 
  
  const update_name = req.body.update_name 
  const update_last_name= req.body.update_last_name
  const update_phone =req.body.update_phone
  const update_birth = req.body.update_birth


  const sql =  ` UPDATE dentist.patient_detials  SET name= ? ,last_name = ?,email = ?,phone = ?,country = ?,state = ?,city = ?,zip_code = ?,address =?,birth_date = ?,
    emergency_contact = ?,preference = ?,gender = ?,guardian = ?,patient_id = ?,notes = ?  WHERE name LIKE '${update_name}' AND phone LIKE '${update_phone}' 
   AND last_name LIKE '${update_last_name}' AND birth_date LIKE '${update_birth}'`  
  // SET ContactName='Alfred Schmidt', City='Frankfurt' WHERE CustomerID=1;
 connection.query(sql,[Name,last_name,email,phone,country,state,city,zip_code,address,birth,emergency,preference,gender,guardian,patient_id,notes],(err,data)=>{
  if(err){
      console.log(err);
      // res.send(err)
  }

  if(data){
    res.json({message:"patient Updated"})
  }
})

})
    
    

app.get('/json_test',(req,res)=>{

res.json(dummy2)

})





app.listen(8082,()=>{
  console.log("i'm listening to 8082")
})