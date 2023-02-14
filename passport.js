const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const mysql = require("mysql")
var MicrosoftStrategy = require('passport-microsoft').Strategy;

const GOOGLE_CLIENT_ID =
  "your id";
const GOOGLE_CLIENT_SECRET = "your id";

GITHUB_CLIENT_ID = "your id";
GITHUB_CLIENT_SECRET = "your id";

FACEBOOK_APP_ID = "your id";
FACEBOOK_APP_SECRET = "your id";

const connection = mysql.createPool('mysql://m75jecg6xa68oswmo9lr:pscale_pw_u2qNamIp6LGUrr8B4Ekc85vILdtUUB1Px1gzRslsubb@aws-eu-west-2.connect.psdb.cloud/login-data?ssl={"rejectUnauthorized":true}')


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
        const id = profile.id
  const displayName = profile.displayName

  const sql = "SELECT * FROM `login-data`.google_creds WHERE id = ?"

  connection.query(sql,[id],(err,data)=>{

    if(err){
      console.log(err);
      res.status(500).send(err)
    }

    if(data){
    console.log('1');
            if(data.length == 1){
      // res.json({message:"User already exists"})
    }else{
  
      const sql = "INSERT INTO `login-data`.google_creds (id,displayname) VALUES (?,?)"

      connection.query(sql,[id,displayName],(err,data)=>{
        if(err){
          console.log('2');
          console.log(err);
          // res.status(500).send(err)
        }

        if(data){
          console.log('3');
          // res.json({message:"user added"})
        }
        

      })

    }

    }
   



  })
      done(null, profile);
    }
  )
);

// passport.use(
//   new GithubStrategy(
//     {
//       clientID: GITHUB_CLIENT_ID,
//       clientSecret: GITHUB_CLIENT_SECRET,
//       callbackURL: "/auth/github/callback",
//     },
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     }
//   )
// );



passport.use(new MicrosoftStrategy({
    // Standard OAuth2 options
    clientID: process.env.MICRO_cleint_ID,
    clientSecret:process.env.MICRO_CLIENT_SEC ,
    // clientID: process.env.MICRO_CLIENT_ID,
    // clientSecret:process.env.MICRO_SECERT_ID ,
    callbackURL: "/auth/microsoft/callback",
    scope: ['user.read'],

    // Microsoft specific options

    // [Optional] The tenant for the application. Defaults to 'common'. 
    // Used to construct the authorizationURL and tokenURL
    tenant: 'common',

    // [Optional] The authorization URL. Defaults to `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',

    // [Optional] The token URL. Defaults to `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  },
  function(accessToken, refreshToken, profile, done) {
    const id = profile.id
    const displayName = profile.displayName
  
    const sql = "SELECT * FROM `login-data`.google_creds WHERE id = ?"
  
    connection.query(sql,[id],(err,data)=>{
  
      if(err){
        console.log(err);
        res.status(500).send(err)
      }
  
      if(data){
      console.log('1');
              if(data.length == 1){
        // res.json({message:"User already exists"})
      }else{
    
        const sql = "INSERT INTO `login-data`.google_creds (id,displayname) VALUES (?,?)"
  
        connection.query(sql,[id,displayName],(err,data)=>{
          if(err){
            console.log('2');
            console.log(err);
            // res.status(500).send(err)
          }
  
          if(data){
            console.log('3');
            // res.json({message:"user added"})
          }
          
  
        })
  
      }
  
      }
     
  
  
  
    })
      return done(null, profile);
    
  }
));



passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_ID_KEY,
      clientSecret: process.env.FB_SECRET_KEY,
      callbackURL: "/auth/facebook/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      const id = profile.id
      const displayName = profile.displayName
    
      const sql = "SELECT * FROM `login-data`.google_creds WHERE id = ?"
    
      connection.query(sql,[id],(err,data)=>{
    
        if(err){
          console.log(err);
          res.status(500).send(err)
        }
    
        if(data){
        console.log('1');
                if(data.length == 1){
          // res.json({message:"User already exists"})
        }else{
      
          const sql = "INSERT INTO `login-data`.google_creds (id,displayname) VALUES (?,?)"
    
          connection.query(sql,[id,displayName],(err,data)=>{
            if(err){
              console.log('2');
              console.log(err);
              // res.status(500).send(err)
            }
    
            if(data){
              console.log('3');
              // res.json({message:"user added"})
            }
            
    
          })
    
        }
    
        }
       
    
    
    
      })
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
