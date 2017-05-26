/**
 * Created by stardust on 2017/5/16.
 */
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var redisClient = require('../scripts/redisdb')
var config = require('../scripts/config')
var router = express.Router();

var News = require('../scripts/newsData')
let newsTemplate = ejs.compile(fs.readFileSync('views/newsitem.ejs', 'utf-8'))
let commentTemplate = ejs.compile(fs.readFileSync('views/commentitem.ejs', 'utf-8'))

let expireTime = 1 // expire after 60 seconds
let expireFlag = "EX"

function cache(key, value, notExpire, time) {
    if( notExpire )
        return redisClient.set(key, value)
    else
        return redisClient.set(key, value, expireFlag, time ? time : expireTime)
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/*GET News Lists of a specific genre
*
* */
router.get('/list', function (req, res, next) {
    let genre = req.query.genre;
    let tag = req.query.tag
    let html = req.query.html
    let limit = req.query.limit
    let offset = req.query.offset
    if( !genre && !tag ){
        res.status(404).render('error',{
            status: 404,
            message: "Page not found"
        })
        return;
    }
    if( tag || (genre && News.validGenre(genre)) ){
        // check redis
        let key = JSON.stringify({
            tag: tag,
            genre: genre,
            html: html,
            offset: offset,
            limit: limit
        })
        redisClient.get(key, function (err, reply) {
            if( err ){
                console.log(err)
                res.json({ message: "redis error"})
            }else if( reply ){
                console.log("redis hit")
                return res.send(reply)
            }else{
                News.getList(genre, tag, (err, result) => {
                    if( err ){
                        console.log(err);
                        res.json();
                    }else{          // success
                        console.log('result.length = ' + result.length)
                        if( html ){
                            var ret = ""
                            for(let idx = 0; idx < result.length; idx++){
                                ret += newsTemplate({ news: result[idx] }) + "\n"
                            }
                            ret = {
                                size: result.length,
                                html: ret
                            }
                            cache(key, JSON.stringify(ret))
                            res.json(ret)
                        }else{
                            cache(key, JSON.stringify(result))
                            res.json(result);
                        }
                    }
                }, offset, limit)
            }
        })

    }else{
        res.json({ message: "Invalid Genre" })
    }
})

router.get('/content', function (req, res) {
    let id = req.query.id
    if( !id ){
        return res.status(404).json({})
    }else{
        let key = JSON.stringify({
            type: "content",
            newsid: id
        })
        redisClient.get(key, function (err, reply) {
            if( err ){
                console.log(err)
                res.status(500).json({
                    message: "redis error"
                })
            }else if( reply ){
                console.log("redis hit")
                return res.send(reply)
            }else{
                News.getContent(id, function (statusCode, result) {
                    if( statusCode == 200 ){
                        cache(key, JSON.stringify(result), true)        // not expire
                        res.json(result)
                    }else{
                        res.status(statusCode).json({})
                    }
                })
            }
        })
    }
})

router.get('/comments', function (req, res) {
    let group = req.query.group_id
    let item = req.query.item_id
    if( !group || !item ){
        return res.status(404).json({})
    }else {
        News.getComment(group, item, function (statusCode, result) {
            if( statusCode == 200 ){
                result = result.data.comments
                var ret = ''
                for(let index in result){
                    ret += commentTemplate({ comment: result[index] })
                }
                res.send(ret)
            }else{
                res.status(statusCode).json({})
            }
        })
    }
})

router.get('/tags', function (req, res) {
    News.getList('hot', null, (err, result) => {
        if( err ){
            console.log(err);
            res.json();
        }else{          // success
            var ret = []
            for(let idx = 0; idx < result.length; idx++){
                ret.push(result[idx].keywords[0])
            }
            res.json(ret);
        }
    })
})

// get news object
let genres = config['genres']
router.get('/:title', function (req, res) {
    let title = req.params.title
    if( !title ){
        return res.status(404).json({})
    }
    let key = JSON.stringify({
        type: "news",
        title: title
    })
    console.log("key = " + key)
    // use redis to get news object
    redisClient.get(key, function (err, reply) {
        if( err ){
            console.log(err)
            res.status(500).json({ message: "redis error"})
        }else if( reply ){
            console.log("redis hit")
            res.render('newspage', {
                genres: genres,
                news: JSON.parse(reply)
            })
        }else{
            News.getNews(title, function (err, result) {
                if( err ){
                    console.log(err)
                    res.status(500).json({})
                }else if( result ){
                    console.log("seo_url = " + result.item_seo_url)
                    cache(key, JSON.stringify(result), true)        // news content not expire
                    // res.json(result)
                    res.render('newspage', {
                        genres: genres,
                        news: result
                    })
                }else{
                    res.status(404).render('error', {
                        status: 404,
                        message: "Page Not Found"
                    })
                }
            })
        }
    })
})


module.exports = router;
