const express = require('express');
const path = require('path');   
const app = express();
const bodyParser = require('body-Parser');
const session = require('express-session');
const bcrypt = require('bcrypt');   
const mongoose = require('mongoose');
const UserSchema = require('./public/User');
const os = require('os');
const { fork } = require('child_process');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended :false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//INFORMACION DEL SERVER
app.get('/info', function (req, res) {
  res.json({
    "argv": process.argv,
    "execPath": process.execPath,
    "platform": os.platform(),
    "pid": process.pid,
    "nodeVersion": process.version,
    "cwd": process.cwd(),
    "rss": process.memoryUsage().rss
  });
});


//Inicio Sesion,Registro y Autenticador
app.post('/register',(req,res)=>{
    const {username, password}= req.body;
    let newUser = new UserSchema ({username,password});

    newUser.save(err =>{
        if(err){
            res.status(500).send('ERROR AL REGISTRAR AL USUARIO')
        }else{
            res.status(200).send('Usuario Registrado')
        }return
    })
});
app.post('/authenticate',(req,res)=>{
    const {username, password}= req.body;
    UserSchema.findOne({username},(err, user)=>{
        if(err){
            res.status(500).send('ERROR AL AUTENTICAR AL USUARIO')
        }else if(!user){
            res.status(500).send('EL USUARIO NO EXISTE')
        }else{
            user.isCorrectPassword(password,(err,result)=>{
                if(err){
                    res.status(500).send('ERROR AL AUTENTICAR');
                }else if(result){
                    isLoggedIn = true;
                    res.status(200).send('USUARIO AUTENTICADO CORRECTAMENTE');
                }else{
                    res.status(500).send('USUARIO Y/O CONTRASEÑA INCORRECTA');
                }return
            })
        }
    })
});
app.post('/login', (req, res) => {
    req.session.username = req.body.username;
    isLoggedIn = false;
    res.redirect('/');
});
app.post('/logout', (req, res) => {
    isLoggedIn = false;
    req.session.username = null;
    res.redirect('/');
});
app.get('/username', (req, res) => {
    isLoggedIn = true
    if (isLoggedIn) { 
    res.send(req.session.username); 
    } else {
    res.send(null); 
    }
    });

//MongoDB
require("dotenv").config();
    let MONGO_URL = process.env.MONGO_DB_URL;
mongoose.connect(MONGO_URL, function(err){
    if(err){
        throw err;
       } else {
        console.log(`Conectado a la BD ${MONGO_URL}`);
       }
});


//Cantidad de numeros Randoms Generados
app.get('/randoms', function (req, res) {
    let cant = req.query.cant || 100000000;
    let randomProcess = fork('./randomGenerator.js');
    randomProcess.send({cant});
  
    randomProcess.on('message', (randomNumbers) => {
      res.json(randomNumbers);
    });
  });


app.listen(3000,()=>{
    console.log('Server Iniciado');
});

module.exports = app;