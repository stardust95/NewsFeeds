/**
 * Created by stardust on 2017/5/17.
 */

var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs');
var config = require('./config');

var userSchema = mongoose.Schema({
    email: String,
    password: String,
    fullname: String,
    interest: Array
});

userSchema.methods.validPassword = function (pw) {
    return bcrypt.compareSync(pw, this.password);
};

userSchema.methods.addInterest = function(newsid){
    this.interest.push(newsid)
};

module.exports = mongoose.model('user', userSchema);