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

app.use("/auth", authRoute);

const connection = mysql.createPool('mysql://m75jecg6xa68oswmo9lr:pscale_pw_u2qNamIp6LGUrr8B4Ekc85vILdtUUB1Px1gzRslsubb@aws-eu-west-2.connect.psdb.cloud/login-data?ssl={"rejectUnauthorized":true}')

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



// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://127.0.0.1:8082/auth/google/callback",
//     scope: ['profile'] 
//   },
//   function(accessToken, refreshToken, profile) {

//   console.log(profile.id,profile.displayName);


//   const id = profile.id
//   const displayName = profile.displayName

//   const sql = "SELECT * FROM `login-data`.google_creds WHERE id = ?"

//   connection.query(sql,[id],(err,data)=>{

//     if(err){
//       console.log(err);
//       res.status(500).send(err)
//     }

//     if(data){
//     console.log('1');
//             if(data.length == 1){
//       // res.json({message:"User already exists"})
//     }else{
  
//       const sql = "INSERT INTO `login-data`.google_creds (id,displayname) VALUES (?,?)"

//       connection.query(sql,[id,displayName],(err,data)=>{
//         if(err){
//           console.log('2');
//           console.log(err);
//           // res.status(500).send(err)
//         }

//         if(data){
//           console.log('3');
//           // res.json({message:"user added"})
//         }
        

//       })

//     }

//     }
   



//   })

//     // User.findOrCreate({ googleId: profile.id }, function (err, user) {
//     // });
//   }
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
        res.json({message:"User already exists"})
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



// app.get('/auth/facebook',
//   passport.authenticate('facebook'));

  // app.get('/login/facebook', passport.authenticate('facebook', {
  //   scope: [ 'email', 'user_location' ]
  // }));

// app.get('/auth/facebook/app',
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

  // app.get('/auth/google',
  // passport.authenticate('google', { scope: ['profile'] }));





  // already commenteed

// app.get('/auth/google/callback', 
//   passport.authenticate("google", {
    
//   successRedirect: "http://127.0.0.1:5173/",
//   failureRedirect: "http://127.0.0.1:5173/",
//   })
//   ),






// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.status(200).send("ji")
//   });


app.listen(8082,()=>{
  console.log("i'm listening to 8082")
})