/**
 * Created by cs on 2017/5/22.
 */


var User = require('../scripts/userModel'),
    mongoose = require('mongoose'),
    nev = require('email-verification')(mongoose),
    config = require('../scripts/config'),
    bcrypt = require('bcryptjs'),
    MongoClient = require('mongodb');

// sync version of hashing function
var myHasher = function(password, tempUserData, insertTempUser, callback) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return insertTempUser(hash, tempUserData, callback);
};

mongoose.Promise = require('bluebird');
mongoose.connect(config["connect"]);

let mailOption = config["mailoptions"]
console.log(mailOption["email"] + "\n" + mailOption["password"])
console.log('http://' + config["host"] + ':' + config["port"] + '/users')
nev.configure({
    verificationURL: 'http://' + config["host"] + ':' + config["port"] + '/users/email-verification/${URL}',
    persistentUserModel: User,
    tempUserCollection: 'newsfeed_tempusers',

    transportOptions: {
        service: mailOption["service"],
        auth: {
            user: mailOption["email"],
            pass: mailOption["password"]
        }
    },
    verifyMailOptions: {
        from: 'Do Not Reply ' + mailOption["email"],
        subject: 'Please confirm account for NewsFeed',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    },

    confirmMailOptions: {
        from: 'Do Not Reply ' + mailOption["email"],
        subject: 'Account register successfully',
        html: '<p>Successful</p>',
        text: 'Your account has been registered successfully'
    },
    hashingFunction: myHasher

}, function (err, options) {
    if( err )
        console.log(err)
})

nev.generateTempUserModel(User, function (unused, model) {
    if( model ){
        console.log("Register TempUserModel Successful")
    }else {
        console.log("Register TempUserModel Failed")
    }
})



exports.nev = nev
