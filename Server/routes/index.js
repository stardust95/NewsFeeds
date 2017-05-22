var express = require('express');
var newsData = require('../scripts/newsData')
var config = require('../scripts/config')
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
      title: 'Express',
      genres: config['genres']
  });
});

// TODO: access login if already login?

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'Express',
        genres: config['genres']
    });
})

router.get('/register', function (req, res, next) {
    res.render('register', {
        title: 'Register',
        genres: config['genres']
    })
})

router.get('/tag/:word', function (req, res, next) {
    res.render('tagnews', {
        tag: req.params.word
    })
})

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
