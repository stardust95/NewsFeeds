var express = require('express');
var newsData = require('../model/newsData')
var config = require('../model/config')
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
      title: 'Express',
      genres: config['genres']
  });
});


let genres = config['genres']
router.get('/:genre', function (req, res, next) {
    if( newsData.validGenre(req.params.genre) )
        res.render('newslist', {
            genres: config['genres'],
            title: genres[req.params.genre],
            genre: req.params.genre
        });
    else
        res.status(404).send()
})

module.exports = router;
