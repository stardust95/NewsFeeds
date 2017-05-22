/**
 * Created by stardust on 2017/5/17.
 */

var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

module.exports = config

