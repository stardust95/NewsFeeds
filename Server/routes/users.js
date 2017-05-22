var express = require('express');

var router = express.Router();
var User = require('../scripts/userModel')
var nev = require('../scripts/userMethods').nev



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function (req, res, next) {
    let user = new User({
        email: req.body.email,
        password: req.body.password,
        fullname: req.body.fullname,
        interest: []
    })
    console.log(user)
    if( !user.email || !user.password || !user.fullname ){
        res.json({
            message: "Invalid Fields"
        })
        return;
    }
    nev.createTempUser(user, function (err, existingPersistentUser, newTempUser) {
        // some sort of error
        if (err){
            console.log(err)
            res.json({
                message: "Internal Error"
            })
            return;
        }

        // user already exists in persistent collection...
        if (existingPersistentUser){
            console.log(existingPersistentUser)
            res.json({
                message: 'Email Already Exists'
            })
            return;
        }
        // handle user's existence... violently.
        console.log("newTempUser" + newTempUser)
        // a new user
        if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];
            nev.sendVerificationEmail(user.email, URL, function(err, info) {
                if (err){
                    console.log(err)
                    res.json()
                }else {
                    res.json({
                        success: true,
                        message: info
                    })
                }
            });
            // user already exists in temporary collection...
        } else {
            console.log(user.email + " register failed")
            res.json({
                message: 'Email Already Exists' // ! as TempUser
            })
            // flash message of failure...
        }
    })
})

router.post('/register/resend', function (req, res, next) {
    nev.resendVerificationEmail(req.body.email, function (err, userFound) {
        if (err){
            console.log(err)
            return;
        }
        // handle error...

        if (userFound) {
            res.json({
                success: true
            })
        }else{
            res.j({
                message: "Internal Error"
            })
        }
    })
})

// TODO: provide a verification success page
router.get('/email-verification/:url', function (req, res) {
    let url = req.params.url;

    nev.confirmTempUser(url, function (err, user) {
        if( err ){
            console.log(err)
            res.json()
        }else {
            nev.sendConfirmationEmail(user.email, function (err, info) {
                if( err ){
                    res.json({
                        message: "Sending confirmation email failed"
                    })
                }else {
                    res.cookie('user', new Buffer(user.email).toString('base64'))        // automatically login
                    res.json({
                        success: true,
                        message: info
                    })
                }
            })
        }
    })
})

router.post('/login', function (req, res, next) {
  UserData.findByEmail(req.body.email, function (err, result) {
      if( err ){
        console.log(err)
      }else {
        if( result.length == 0 ){   // user not exist
          res.json({message: 'Email Not Exist'})
        }else{
          // TODO: login status cookie
          res.cookie('user', 'TODO')
          res.json({
              success: true
          })
        }
      }
  })
})

module.exports = router;
