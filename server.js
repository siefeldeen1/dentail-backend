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
const path = require("path");
const formidable = require('formidable');
const mv = require("mv");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const dummy = require('./dummy.json')
const dummy2 = require('./dummy2.json')
const { json } = require('express')
const Jimp = require('jimp');
const { connect } = require('http2')

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(cors())
app.use(express.json())

app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname))
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

const db_config = {
    host:"database.apture.ai",
    user:"db_user",
    password:"eQt4$JQk8tAifWXv0^!1AiI&0B5ge#",
}

const connection = mysql.createPool(db_config)

// dentist db
//const connection = mysql.createPool('mysql://5md95ivkiw85id6l0bau:pscale_pw_TGZSa8SSGRElvxRB6jQgakzpiwpyRpoPwY7Jlk0VIx@aws-eu-west-2.connect.psdb.cloud/dentist?ssl={"rejectUnauthorized":true}')

// not working old
// const connection2 = mysql.createPool('mysql://m75jecg6xa68oswmo9lr:pscale_pw_u2qNamIp6LGUrr8B4Ekc85vILdtUUB1Px1gzRslsubb@aws-eu-west-2.connect.psdb.cloud/login-data?ssl={"rejectUnauthorized":true}')

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
    const email = req.body.username
    const password = req.body.password
  
    const sql = "SELECT * FROM dentist.login WHERE Email = ?"
  
    connection.query(sql,[email],(err,data)=>{
  
      if(err){
        console.log(err);
        res.status(500).send(err)
      }

      if(data){

              if(data.length == 1){
        res.status(401).json({message:"User already exists"})
      }else{
          res.status(200).json({message:"ok"})
        // const sql = "INSERT INTO dentist.login (Email,password) VALUES (?,?)"

        // bcrypt.genSalt(saltsRounds, function(err, salt) {
        //       bcrypt.hash(password, salt, function(err, hash) {
        //         connection.query(sql,[email,hash],(err,data)=>{
        //           if(err){
        //             console.log(err);
        //             res.status(500).send(err)
        //           }
          
        //           if(data){
        //             res.json({message:"user added"})
        //           }
                  
          
        //         })
          
        //        });
        //     });

        
      }

      }
     

  
  
    })



})




app.post('/login',(req,res)=>{
  const email = req.body.email
  const password = req.body.password

  const sql = "SELECT * FROM dentist.login WHERE Email = ? "

  connection.query(sql,[email],(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    }
    if(data){
      console.log(data);
      if(data.length == 1){
        
        const hashed_password = data[0].password

        if(bcrypt.compareSync(password,hashed_password)){
          const email_name = data[0].Email.split("@")[0]
          const user = {name : email_name,first_name:data[0].first,last_name:data[0].last}
          const accessToken = jwt.sign(user,process.env.SECRET_KEY)
          res.json({message:"clinic is added",clinic_id:data[0].clinic_id,clinic_name:`${data[0].clinic_name}_${data[0].clinic_id}`,accessToken:accessToken})
            // res.status(200).json({message:"allowed",clinic_id:data[0].clinic_id,clinic_name:data[0].clinic_name})
          } else{
            res.status(400).json({message:"password or email is incorrect"})
          }

         
    
       
        
      }else{
        res.status(400).json({message:"password or email is incorrect"})
      }
  }})
})


app.post("/uploadImg",(req,res)=>{


  const form = new formidable.IncomingForm()

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      return
    }
    const ext = path.extname(files.image.originalFilename)
    const videosPath = "images/patients/"
    const oldPath = files.image.filepath
    const newPath = videosPath + uuidv4() + ext

    if (!fs.existsSync(videosPath)) {
      fs.mkdir(videosPath, (err) => {
        if (err) {
          console.log(err);
          return

        }
      })
    }
    mv(oldPath, newPath, (err) => {
      if (err) {
        console.log(err);
        return
      }

      res.json({message:"uploaded",path:newPath})

     
      })

    })


})


app.post("/imgqulity",async (req,res)=>{

  const img = req.body.img


    // img.quality(100 ,async (err, value) => {
    //   // console.log(JSON.stringify(value));
    // })
    // res.send(img.quality(100))
  
Jimp.read(`${img}`)
  .then(image => {
    image.quality(100).getBase64(Jimp.AUTO, (err, reson) => {
    // console.log(res)
    res.json({message:"Updated",img:reson})

  })
  })
  .catch(err => {
    console.log(err);
    res.status(500).send(err)
  });

  // const form = new formidable.IncomingForm()
  // form.parse(req, (err, fields, files) => {
    
  //   if (err) {
  //     console.log(err);
  //     return
  //   }
  //   const ext = path.extname(files.image.originalFilename)
  //   const videosPath = "images/patients/"
  //   const oldPath = files.image.filepath
  //   const newPath = videosPath + uuidv4() + ext

  //   if (!fs.existsSync(videosPath)) {
  //     fs.mkdir(videosPath, (err) => {
  //       if (err) {
  //         console.log(err);
  //         return

  //       }
  //     })
  //   }
  //   mv(oldPath, newPath, (err) => {
  //     if (err) {
  //       console.log(err);
  //       return
  //     }

  //     res.json({message:"uploaded",path:newPath})

     
  //     })

  //   })


})




app.post('/clinic_info',(req,res)=>{

             const business = req.body.business
             const first_name = req.body.first_name
             const last_name = req.body.last_name
             const first = req.body.first
             const last = req.body.last
             const email_off = req.body.email_off
             const phone_off = req.body.phone_off
             const email = req.body.email
             const phone = req.body.phone
             const country = req.body.country
             const state = req.body.state
             const city = req.body.city
             const zip_code = req.body.zip_code
             const address = req.body.address
             const facebook = req.body.facebook
             const twitter = req.body.twitter
             const instagram = req.body.instagram

             const acc_email = req.body.acc_email
             const acc_password = req.body.acc_password

            // console.log(acc_email,acc_password);

            const sql = 'INSERT INTO dentist.login (`Email`,`password`,`clinic_name`,`first`,`last`) VALUES (?,?,?,?,?)'

            bcrypt.genSalt(saltsRounds, function(err, salt) {
              bcrypt.hash(acc_password.value, salt, function(err, hash) {
                connection.query(sql,[acc_email.value, hash,  business,first,last],(err,data2)=>{
                  if(err){
                    console.log(err);
                    res.status(500).send(err)
                  }
          
                  if(data2){
                    // console.log(acc_email.value);
                    const email_name = acc_email.value.split("@")[0]
                     const user = {name : email_name,id:data2.insertId,first_name:first,last_name:last}
                     const accessToken = jwt.sign(user,process.env.SECRET_KEY)
              

                     const sqlDB = `CREATE DATABASE ${business}_${data2.insertId}`
                      connection.query(sqlDB,(err)=>{
                        if(err){
                          console.log(err);
                          res.status(500).json({message:"Something went wrong"})
                        }else{
                          const sql_clinic_info =' CREATE TABLE ' + `${business}_${data2.insertId}.clinic_Info `+'( `business` VARCHAR(500), `first_name` VARCHAR(255), `last_name` VARCHAR(255), `email_off` VARCHAR(255), `email` VARCHAR(255), `phone_off` VARCHAR(400), `phone` VARCHAR(400), `facebook` VARCHAR(255), `twitter` VARCHAR(255),`instagram` VARCHAR(255),`address` VARCHAR(255),`city` VARCHAR(255),`state` VARCHAR(255),`country` VARCHAR(255),`zip_code` VARCHAR(400), `id` int auto_increment primary key ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'
                          const sql_comment =' CREATE TABLE ' + `${business}_${data2.insertId}.comments `+'( `comment` LONGTEXT, `tooth_id` VARCHAR(255), `patient_id` VARCHAR(255), `clinic_id` VARCHAR(255), `img_no` VARCHAR(255), `user` VARCHAR(400), `date` VARCHAR(400), `sub_comment` LONGTEXT,  `comments_id` int auto_increment primary key ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'
                          const sql_login =' CREATE TABLE ' + `${business}_${data2.insertId}.login `+'( `Email` VARCHAR(500), `password` VARCHAR(255), `clinic_name` VARCHAR(255), `first` VARCHAR(255), `last` VARCHAR(255), `clinic_id` int auto_increment primary key ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'
                          const sql_patient_detials =' CREATE TABLE ' + `${business}_${data2.insertId}.patient_detials `+'( `name` VARCHAR(200), `email` VARCHAR(255), `phone` VARCHAR(255), `address` VARCHAR(255), `birth_date` VARCHAR(255), `emergency_contact` VARCHAR(400), `preference` VARCHAR(400), `gender` VARCHAR(255), `guardian` VARCHAR(255),`notes` VARCHAR(255),`country` VARCHAR(255),`state` VARCHAR(255),`city` VARCHAR(255),`zip_code` VARCHAR(400),`last_name` VARCHAR(255),`clinic_id` VARCHAR(400),`clinic_name` VARCHAR(255),`imgs` LONGTEXT,`data` LONGTEXT,`added_date` LONGTEXT, `patient_id` int auto_increment primary key ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'
                          const sql_schedule_data =' CREATE TABLE ' + `${business}_${data2.insertId}.schedule_data `+'( `title` VARCHAR(500), `start` VARCHAR(255), `end` VARCHAR(255), `descr` VARCHAR(255), `allday` VARCHAR(255), `clinic_id` VARCHAR(400), `clinic_name` VARCHAR(400), `id` int auto_increment primary key ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'
                          const sql_sub_comment =' CREATE TABLE ' + `${business}_${data2.insertId}.sub_comment `+'( `sub_comment` LONGTEXT, `comment_id` VARCHAR(2505), `img_no` VARCHAR(255), `patient_id` INT, `tooth_id` INT, `clinic_id` INT, `user` VARCHAR(2000),`date` VARCHAR(2000), `sub_comment_id` int auto_increment primary key ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'
                          const sql_teeth_info =' CREATE TABLE ' + `${business}_${data2.insertId}.teeth_info `+'( `name` LONGTEXT, `teeth_no` INT, `value` VARCHAR(2550), `type` VARCHAR(2550), `patient_name` VARCHAR(2050), `patient_id` VARCHAR(2050), `clinic_id` VARCHAR(2000),`img_no` INT,`parameter` VARCHAR(405),`surface` VARCHAR(405),`stage` VARCHAR(405),`date` VARCHAR(405),`comment` LONGTEXT,`user` VARCHAR(1000),`isdeleted` VARCHAR(405),  `id` int auto_increment primary key ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'
                         
                          connection.query(sql_clinic_info,(org_err)=>{
                          if(org_err){
                            console.log(org_err);
                            res.status(500).json({message:"Something went wrong in org sql"})
                        }else{
                            connection.query(sql_comment,(comment_err)=>{
                                if(comment_err){
                                console.log(comment_err);
                                res.status(500).json({message:"Something went wrong in org sql"})
                               }else{
                                    connection.query(sql_login,(login_err)=>{
                                      if(login_err){
                                        console.log(login_err);
                                        res.status(500).json({message:"Something went wrong in org sql"})
                                       }else{
                                            connection.query(sql_patient_detials,(patient_err)=>{
                                              if(patient_err){
                                                console.log(patient_err);
                                                res.status(500).json({message:"Something went wrong in org sql"})
                                               }else{
                                                  connection.query(sql_schedule_data,(schedule_err)=>{
                                                    if(schedule_err){
                                                      console.log(schedule_err);
                                                      res.status(500).json({message:"Something went wrong in org sql"})
                                                     }else{
                                                          connection.query(sql_sub_comment,(sub_com_err)=>{
                                                            if(sub_com_err){
                                                              console.log(sub_com_err);
                                                              res.status(500).json({message:"Something went wrong in org sql"})
                                                             }else{
                                                                  connection.query(sql_teeth_info,(teeth_err)=>{
                                                                    if(teeth_err){
                                                                      console.log(teeth_err);
                                                                      res.status(500).json({message:"Something went wrong in org sql"})
                                                                     }else{

                                                                         const sql = "INSERT INTO "+ `${business}_${data2.insertId}.clinic_Info`+ " (`business`,`first_name`,`last_name`,`email_off`,`phone_off`,`email`,`phone`,`country`,`state`,`city`,`zip_code`,`address`,`facebook`,`twitter`,`instagram`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

                                                                        connection.query(sql,[business,first_name,last_name,email_off,phone_off,email,phone,country,state,city,zip_code,address,facebook,twitter,instagram],(err,data)=>{
                                                                         if(err){
                                                                          console.log(err);
                                                                          res.status(500).send(err)
                                                                         }
                                                                    
                                                                           if(data){
                                                                          
                                                                             res.json({message:"clinic is added",clinic_id:data2.insertId,clinic_name:`${business}_${data2.insertId}`,accessToken:accessToken})

                                                                          //  connection.query(sql,[data.insertId,business],(err,data2)=>{
                                                                          //   if(err){
                                                                          //     res.status(500).send(err)
                                                                          //   }
                                                                          //   if(data2){
                                                                          //     res.json({message:"clinic is added"})
                                                                          //   }
                                                                          // })
                                                                        
                                                                        }
                                                                      })
                                                                     }
                                                                  })
                                                             }
                                                          })
                                                     }
                                                  })
                                               }
                                            }) 
                                       }
                                    })
                                }
                            })
                        }
                        })
                        }
                      })



                 
                  }
                  
          
                })
          
               });
            });

           
          

            })



app.post('/create_org',(req,res)=>{

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
  const clinic_id = req.body.clinic_id
  const clinic_name = req.body.clinic_name
  const imgs_arr = req.body.imgs
  const added_date = req.body.added_date

  const imgs = JSON.stringify(imgs_arr)
  const data = JSON.stringify(req.body.data)


  // console.log(clinic_name);
if(patient_id.length < 1){
  const sql = "INSERT INTO "+  `${clinic_name}.patient_detials`+ "(`name`,`last_name`,`email`,`phone`,`country`,`state`,`city`,`zip_code`,`address`,`birth_date`,`emergency_contact`,`preference`,`gender`,`guardian`,`notes`,`clinic_id`,`clinic_name`,`imgs`,`data`,`added_date`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  connection.query(sql,[Name,last_name,email,phone,country,state,city,zip_code,address,birth,emergency,preference,gender,guardian,notes,clinic_id,clinic_name,imgs,data,added_date],(err,data)=>{
    if(err){
      console.log(err);
      res.status(500).send(err)
    }

    if(data){
      res.json({message:"user added"})
    }
    

  })
}else{
  const sql = "INSERT INTO"+ `${clinic_name}.patient_detials`+ "(`name`,`last_name`,`email`,`phone`,`country`,`state`,`city`,`zip_code`,`address`,`birth_date`,`emergency_contact`,`preference`,`gender`,`guardian`,`patient_id`,`notes`,`clinic_id`,`clinic_name`,`added_date`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  connection.query(sql,[Name,last_name,email,phone,country,state,city,zip_code,address,birth,emergency,preference,gender,guardian,patient_id,notes,clinic_id,clinic_name,added_date],(err,data)=>{
    if(err){
      console.log(err);
      res.status(500).send(err)
    }

    if(data){
      res.json({message:"user added"})
    }
    

  })
}
 
})


app.get('/render_imgs',(req,res)=>{

  const clinic_id = req.headers.clinic_id
  const clinic_name = req.headers.clinic_name
  const patient_id = req.headers.patient_id 

  const sql = `SELECT * FROM ${clinic_name}.patient_detials WHERE clinic_id LIKE '${clinic_id}%' AND patient_id LIKE '${patient_id}'`
 connection.query(sql,(err,data)=>{
   if(err){
     console.log(err);
     res.status(500).send(err)
   }
 
   if(data){
     res.send(data)
   }
 })
 
 })




app.get('/render_patients',(req,res)=>{

 const clinic_id = req.headers.clinic_id
 const clinic_name = req.headers.clinic_name
  
 const sql = `SELECT * FROM ${clinic_name}.patient_detials WHERE clinic_id LIKE '${clinic_id}%'`
connection.query(sql,(err,data)=>{
  if(err){
    console.log(err);
    res.status(500).send(err)
  }

  if(data){
    res.send(data)
  }
})

})

app.get('/patient_Img',(req,res)=>{
  const clinic_id = req.headers.clinic_id
  const clinic_name = req.headers.clinic_name
  const patient_id = req.headers.patient_id
  const first = req.headers.first
  const last = req.headers.last

  const sql =  `SELECT * FROM ${clinic_name}.patient_detials WHERE name LIKE '${first}%' AND clinic_id LIKE '${clinic_id}%' AND last_name LIKE '${last}%' AND patient_id LIKE '${patient_id}%'  `

  connection.query(sql,(err,data)=>{
    if(err){
      console.log(err);
      res.status(500).send(err)
    }
    // console.log(sql);
    if(data){
      console.log(data);
      res.send(data)
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

  // console.log(Date);

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
  const clinic_name = req.headers.clinic_name
  // console.log(name,last_name,phone,birth);
  const sql =  `SELECT * FROM ${clinic_name}.patient_detials WHERE name LIKE '${name}%' AND phone LIKE '${phone}%' AND last_name LIKE '${last_name}%' AND birth_date LIKE '${birth}%'  `
  // const sql =  "SELECT * FROM dentist.patient_detials WHERE name LIKE"+ ` '%${name}%' or phone LIKE '%${phone}%' or last_name LIKE '%${last_name}%' or birth_date LIKE '%${birth}%'  `

    // console.log(sql);

  connection.query(sql,(err,data)=>{
   if(err){
       console.log(err);
       // res.send(err)
   }
 
   if(data){
    // console.log("data",data);
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
    
    
app.post('/comments',(req,res)=>{
  const comment = req.body.comment
  const teeth_no = req.body.teeth_no
  const clinic_name = req.body.clinic_name

  const sql = "INSERT INTO "+ `${clinic_name}.comments` +"(`comment`,`teeth_no`) VALUES(?,?) "

  connection.query(sql,[comment,teeth_no],(err,data)=>{
    if(err){
      console.log(err);
      res.status(500).send(err)
    }

    if(data){
      res.json({message:"comment added"})
    }
    

  })

})



app.get('/json_test',(req,res)=>{

res.json(dummy2)

})
    

app.post('/json_test',(req,res)=>{
  const data =  req.body.data


  // console.log(data);


})


app.post('/appointment_date',(req,res)=>{
  const title = req.body.title
  const start = req.body.start
  const end = req.body.end
  const descr = req.body.descr
  const clinic_id = req.body.clinic_id
  const clinic_name = req.body.clinic_name

   const sql = "INSERT INTO " + `${clinic_name}.schedule_data` + "(`title`,`start`,`end`,`descr`,`clinic_id`) VALUES (?,?,?,?,?)"
  connection.query(sql,[title,start,end,descr,clinic_id],(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    } 
    if(data){
      res.json({message:"new appointment added"})
    }
  })

})

app.get("/dates_appoint",(req,res)=>{

    const clinic_id = req.headers.clinic_id
    const clinic_name = req.headers.clinic_name

  const sql = "SELECT * FROM " + `${clinic_name}.schedule_data `+ "WHERE `clinic_id`= ?"
  connection.query(sql,[clinic_id],(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    }
    if(data){
      res.status(200).send(data)
    }
  })
})

app.put("/dates_appoint",(req,res)=>{

  const clinic_id = req.body.clinic_id
  const clinic_name = req.body.clinic_name
  const start = req.body.start
  const end = req.body.end
  const id = req.body.id

  const sql = "UPDATE" + `${clinic_name}.schedule_data` +"SET start=? , end=?  WHERE id = ?"
  connection.query(sql,[start,end,id],(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    }
    if(data){
      res.status(200).send(data)
    }
  })
})
app.get("/dates_appoint_info",(req,res)=>{

  const clinic_id = req.headers.clinic_id
  const clinic_name = req.headers.clinic_name
  const title = req.headers.title
  const id = req.headers.id

  const sql = `SELECT * FROM ${clinic_name}.schedule_data WHERE title LIKE '${title}' AND  id LIKE '${id}' AND clinic_id LIKE '${clinic_id}'`
  connection.query(sql,(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    }
    if(data){
      res.status(200).send(data)
    }
  })
})

app.delete("/dates_appoint",(req,res)=>{

  const clinic_id = req.headers.clinic_id
  const clinic_name = req.headers.clinic_name
  const title = req.headers.title
  const id = req.headers.id

  const sql = "DELETE FROM " +`${clinic_name}.schedule_data` + "WHERE `title` = ? AND  `id` = ? AND `clinic_id` = ?"
  connection.query(sql,[title,id,clinic_id],(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    }
    if(data){
      res.status(200).send(data)
    }
  })
})

app.put("/dates_appoint_info",(req,res)=>{

  const clinic_id = req.body.clinic_id
  const clinic_name = req.body.clinic_name
  // const start = req.body.start 
  // const end = req.body.end
  const id = req.body.id
  const descr = req.body.descr
  const title = req.body.title
  // console.log(title);

  const sql = "UPDATE " + `${clinic_name}.schedule_data` +"SET descr=?,title=?  WHERE id = ? AND clinic_id=? "
  connection.query(sql,[descr,title,id,clinic_id],(err,data)=>{
    if(err){
      console.log(err)
      res.status(500).send(err)
    }
    if(data){
      res.status(200).send(data)
    }
  })
})


app.post('/teeth_info',(req,res)=>{

              const name = req.body.name
              const teeth_no = req.body.teeth_no
              const parameter = req.body.parameter
              const surface = req.body.surface
              const stage = req.body.stage
              const type = req.body.type
              const patient_name = req.body.patient_name
              const patient_id = req.body.patient_id
              const clinic_id = req.body.clinic_id
              const clinic_name = req.body.clinic_name
              const img_no = req.body.img_no
              const date = req.body.date


     const sql = ("INSERT INTO " + `${clinic_name}.teeth_info` +"(`name`,`teeth_no`,`parameter`,`surface`,`stage`,`type`,`patient_name`,`patient_id`,`clinic_id`,`img_no`,`date`) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
     connection.query(sql,[name,teeth_no,parameter,surface,stage,type,patient_name,patient_id,clinic_id,img_no,date],(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.status(200).send(data)
      }
    })
})

app.post('/teeth_info_first',(req,res)=>{

              const name = req.body.name
              const teeth_no = req.body.teeth_no
              const parameter = req.body.parameter
              const surface = req.body.surface
              const stage = req.body.stage
              const type = req.body.type
              const patient_name = req.body.patient_name
              const patient_id = req.body.patient_id
              const clinic_id = req.body.clinic_id
              const clinic_name = req.body.clinic_name
              const img_no = req.body.img_no
              const date = req.body.date
              const length = req.body.length


  const sql = (`SELECT * FROM ${clinic_name}.teeth_info WHERE  patient_id LIKE '${patient_id}'AND clinic_id LIKE '${clinic_id}'AND img_no LIKE '${img_no}' AND patient_name LIKE '${patient_name}' `)
     connection.query(sql,(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        // console.log(data.length,length);
        if(data.length >= length){
          res.status(400).json({message:"no need to insert"})
        }else{
          // res.status(200).json({message:"no need to insert"})
            const sql = ("INSERT INTO "+ `${clinic_name}.teeth_info `+"(`name`,`teeth_no`,`parameter`,`surface`,`stage`,`type`,`patient_name`,`patient_id`,`clinic_id`,`img_no`,`date`) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
          connection.query(sql,[name,teeth_no,parameter,surface,stage,type,patient_name,patient_id,clinic_id,img_no,date],(err,data)=>{
            if(err){
              console.log(err)
              res.status(500).send(err)
            }
            if(data){
              res.status(200).send(data)
            }
          })
        }
      }
    })

    
})

app.get('/teeth_info',(req,res)=>{


              // const patient_name = req.headers.patient_name
              const patient_id = req.headers.patient_id
              const clinic_id = req.headers.clinic_id
              const clinic_name = req.headers.clinic_name
              const img_no = req.headers.img_no
          

     const sql = (`SELECT * FROM ${clinic_name}.teeth_info WHERE  patient_id LIKE '${patient_id}'AND clinic_id LIKE '${clinic_id}'AND img_no LIKE '${img_no}' `)
     connection.query(sql,(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.status(200).send(data)
      }
    })
})

app.delete('/teeth_info',(req,res)=>{


          // const patient_name = req.headers.patient_name
          const patient_id = req.headers.patient_id
          const clinic_id = req.headers.clinic_id
          const clinic_name = req.headers.clinic_name
          const img_no = req.headers.img_no
          const tooth_id = req.headers.tooth_id

     const sql = (`DELETE FROM ${clinic_name}.teeth_info WHERE id = '${tooth_id}' AND patient_id = '${patient_id}'AND clinic_id = '${clinic_id}'AND img_no = '${img_no}' `)
     connection.query(sql,(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.status(200).send(data)
      }
    })
})


app.post('/join_org',(req,res)=>{

  const email = req.body.email
  const password = req.body.password
  const clinic_name = req.body.clinic_name
  const clinic_id = req.body.clinic_id
  const first = req.body.first
  const last = req.body.last

  const sql = "SELECT * FROM "+ `${clinic_name}.login` +"WHERE clinic_name =? AND clinic_id = ?"
  
  connection.query(sql,[clinic_name,clinic_id],(err,data)=>{

    if(err){
      console.log(err);
      res.status(500).send(err)
    } 
    if (data){
  
      if(data.length > 0){
        const sql = 'INSERT INTO '+`${clinic_name}.login `+'(`Email`,`password`,`clinic_id`,`clinic_name`,`first`,`last`) VALUES (?,?,?,?,?,?)'

        bcrypt.genSalt(saltsRounds, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
            connection.query(sql,[email, hash,clinic_id, clinic_name,first,last],(err,data2)=>{
              if(err){
                console.log(err);
                res.status(500).send(err)
              }
      
              if(data2){
                const email_name = email.split("@")[0]
              //  res.json({message:"clinic is added",clinic_id:clinic_id,clinic_name:clinic_name})
               const user = {name : email_name,id:data2.insertId,first_name:first,last_name:last}
               const accessToken = jwt.sign(user,process.env.SECRET_KEY)
            
               res.json({message:"clinic is added",clinic_id:clinic_id,clinic_name:`${clinic_name}_${clinic_id}`,accessToken:accessToken})
              }
              
      
            })
      
           });
        });
      }
     
    }
  
  })

  
})



app.post("/teeth_comments",(req,res)=>{
  const comment = req.body.comment
  const clinic_id = req.body.clinic_id
  const clinic_name = req.body.clinic_name
  const user = req.body.user
  const img_no = req.body.img_no
  const tooth_id = req.body.tooth_id
  const patient_id = req.body.patient_id
  const date = req.body.date

 jwt.verify(user,process.env.SECRET_KEY,(err,user2)=>{
    if(err){
      res.status(500).send(err)
    }else{
      // res.status(200).send(JSON.stringify({islogged:true,user:user}))
  
       const sql = ("INSERT INTO "+`${clinic_name}.comments `+"(comment,user,date,tooth_id,patient_id,clinic_id,img_no) values (?,?,?,?,?,?,?) ")
      //  const sql = (`UPDATE dentist.comments  SET comment = '${comment}' , user = '${user2.name}', date = '${date}'  WHERE id = '${tooth_id}' AND patient_id = '${patient_id}'AND clinic_id = '${clinic_id}'AND img_no = '${img_no}' `)
       connection.query(sql,[comment,user2.name,date,tooth_id,patient_id,clinic_id,img_no],(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.json({message:"comment added"})
      }
    })
   
      }
  })
 
})

app.post("/teeth_sub_comments",(req,res)=>{
  const sub_comment = req.body.sub_comment
  const comment_id = req.body.comment_id
  const clinic_id = req.body.clinic_id
  const clinic_name = req.body.clinic_name
  const user = req.body.user
  const img_no = req.body.img_no
  const tooth_id = req.body.tooth_id
  const patient_id = req.body.patient_id
  const date = req.body.date

 jwt.verify(user,process.env.SECRET_KEY,(err,user2)=>{
    if(err){
      res.status(500).send(err)
    }else{
      // res.status(200).send(JSON.stringify({islogged:true,user:user}))
  
       const sql = ("INSERT INTO "+ `${clinic_name}.sub_comment` +"(sub_comment,comment_id,user,date,tooth_id,patient_id,clinic_id,img_no) values (?,?,?,?,?,?,?,?) ")
      //  const sql = (`UPDATE dentist.comments  SET comment = '${comment}' , user = '${user2.name}', date = '${date}'  WHERE id = '${tooth_id}' AND patient_id = '${patient_id}'AND clinic_id = '${clinic_id}'AND img_no = '${img_no}' `)
       connection.query(sql,[sub_comment,comment_id,user2.name,date,tooth_id,patient_id,clinic_id,img_no],(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.json({message:"comment added"})
      }
    })
   
      }
  })
 
})

app.get("/teeth_sub_comments",(req,res)=>{
  const clinic_id = req.headers.clinic_id
  const clinic_name = req.headers.clinic_name
  const img_no = req.headers.img_no
  const patient_id = req.headers.patient_id



  
       const sql = ("SELECT * FROM "+`${clinic_name}.sub_comment `+"WHERE patient_id=? AND clinic_id=? AND img_no=?")
     
       connection.query(sql,[patient_id,clinic_id,img_no],(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.send(data)
      }
    })
   
      

 
})



app.put("/teeth_comments",(req,res)=>{
  const comment_id = req.body.comment_id
  const clinic_id = req.body.clinic_id
  const clinic_name = req.body.clinic_name
  const img_no = req.body.img_no
  const tooth_id = req.body.tooth_id
  const patient_id = req.body.patient_id
  const sub_comment = JSON.stringify(req.body.sub_comment)
  // const user = req.body.user
  // const date = req.body.date

//  jwt.verify(user,process.env.SECRET_KEY,(err,user2)=>{
//     if(err){
//       res.status(500).send(err)
//     }else{
      // res.status(200).send(JSON.stringify({islogged:true,user:user}))
  
       
      const sql = ("UPDATE"+ `${clinic_name}.comments` +"SET sub_comment=? WHERE comments_id = ? AND tooth_id=? AND patient_id=? AND clinic_id=? AND img_no=? ")
      // const sql = (`UPDATE dentist.comments  SET sub_comment='${sub_comment}'  WHERE comment = '${comment}' AND tooth_id = '${tooth_id}' AND patient_id = '${patient_id}'AND clinic_id = '${clinic_id}'AND img_no = '${img_no}' `)
    
      connection.query(sql,[sub_comment,comment_id,tooth_id,patient_id,clinic_id,img_no],(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.json({message:"comment added"})
      }
    })
   
      // }
  // })
 
})
app.get("/teeth_comments_info",(req,res)=>{
  const comment_id = req.headers.comment_id
  const clinic_id = req.headers.clinic_id
  const clinic_name = req.headers.clinic_name
  const img_no = req.headers.img_no
  const tooth_id = req.headers.tooth_id
  const patient_id = req.headers.patient_id

//  jwt.verify(user,process.env.SECRET_KEY,(err,user2)=>{
//     if(err){
//       res.status(500).send(err)
//     }else{
      // res.status(200).send(JSON.stringify({islogged:true,user:user}))
  
       
      const sql = ("SELECT * FROM " +`${clinic_name}.comments`+" WHERE comments_id = ? AND tooth_id=? AND patient_id=? AND clinic_id=? AND img_no=? ")
      // const sql = (`UPDATE dentist.comments  SET sub_comment='${sub_comment}'  WHERE comment = '${comment}' AND tooth_id = '${tooth_id}' AND patient_id = '${patient_id}'AND clinic_id = '${clinic_id}'AND img_no = '${img_no}' `)
    
      connection.query(sql,[comment_id,tooth_id,patient_id,clinic_id,img_no],(err,data)=>{
      if(err){
        console.log(err)
        res.status(500).send(err)
      }
      if(data){
        res.send(data)
      }
    })
   
      // }
  // })
 
})

app.get("/teeth_comments",(req,res)=>{
  const clinic_id = req.headers.clinic_id
  const clinic_name = req.headers.clinic_name
  const img_no = req.headers.img_no
  const tooth_id = req.headers.tooth_id
  const patient_id = req.headers.patient_id
  
 const sql = "SELECT * FROM "+ `${clinic_name}.comments` +" WHERE img_no =? AND clinic_id = ? AND tooth_id = ? AND patient_id = ?"

connection.query(sql,[img_no,clinic_id,tooth_id,patient_id],(err,data)=>{
  if(err){
    console.log(err)
    res.status(500).send(err)
  }
  if(data){
    res.send(data)
  }
})
})

app.listen(8082,()=>{
  console.log("i'm listening to 8082")
})