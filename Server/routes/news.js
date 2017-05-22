/**
 * Created by stardust on 2017/5/16.
 */
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');

var router = express.Router();

var News = require('../scripts/newsData')
let newsTemplate = ejs.compile(fs.readFileSync('views/newsitem.ejs', 'utf-8'))

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/*GET News Lists of a specific genre
*
* */
router.get('/list/:genre', function (req, res, next) {
    let genre = req.params.genre;

    if( News.validGenre(genre) ){
        News.getList(genre, (err, result) => {
            if( err ){
                console.log(err);
                res.json();
            }else{          // success
                console.log('result.length = ' + result.length)
                if( req.query.html ){
                    var ret = ""
                    for(let idx = 0; idx < result.length; idx++){
                        ret += newsTemplate({ news: result[idx] }) + "\n"
                    }
                    res.send(ret)
                }else{
                    res.json(result);
                }
            }
        }, req.query.limit, req.query.offset)
    }else{
        res.json({ message: "Invalid Genre" })
    }
})

router.get('/tag/:word', function (req, res) {

})

module.exports = router;
