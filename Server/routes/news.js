/**
 * Created by stardust on 2017/5/16.
 */
var express = require('express');
var router = express.Router();
var News = require('../model/newsData')

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
            }else{
                res.json(result);
            }
        }, req.query.limit, req.query.offset)
    }else{
        res.json({ message: "Invalid Genre" })
    }
})

module.exports = router;
