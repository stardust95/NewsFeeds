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
    if( !user.email || !user.password || !user.fullname ){
        console.log("body = " + req.body())
        res.render('info', {
            title: "Register Failed",
            message: "Invalid Fields"
        })
        return;
    }
    nev.createTempUser(user, function (err, existingPersistentUser, newTempUser) {
        // some sort of error
        if (err){
            console.log(err)
            res.render('info', {
                title: "Error",
                message: 'Internal Error' // ! as TempUser
            })
            return;
        }

        // user already exists in persistent collection...
        if (existingPersistentUser){
            res.render("info", {
                title: "Notice",
                message: 'Email Already Exists' // ! as TempUser
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
                    res.status(500).json()
                }else {
                    res.status(201).render("info", {
                        title: "Notice",
                        message: "Verification Mail Sended"
                    })
                }
            });
            // user already exists in temporary collection...
        } else {
            res.render("info", {
                title: "Register Failed",
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
            res.status(500).json()
            return;
        }
        // handle error...

        if (userFound) {
            res.render("info", {
                title: "Notice",
                message: "Verification mail has been sended",
                success: true
            })
        }else{
            res.render("info", {
                title: "Error",
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
                    res.redirect('/')       // redirect to home page
                }
            })
        }
    })
})

router.post('/login', function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, result) {
      if( err ){
        console.log(err)
      }else {
        if( result.length == 0 ){   // user not exist
          res.json({message: 'Email Not Exist'})
        }else{
          // TODO: login status cookie
          res.cookie('user', 'TODO')
          res.redirect('/')
        }
      }
  })
})

module.exports = router;
