/**
 * Created by stardust on 2017/5/17.
 */

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('./config');
var http = require('http')
var https = require('https')
var querystring = require('querystring')
var oneSignal = require('../scripts/oneSignal');

let genres = config["genres"];
let connectStr = config["connect"]
let collection = config["newscol"]
let endpoint = "https://westus.api.cognitive.microsoft.com/recommendations/v4.0"

function queryParams(source) {
    var array = [];

    for(var key in source) {
        array.push(encodeURIComponent(key) + "=" + encodeURIComponent(source[key]));
    }

    return array.join("&");
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * Math.abs(max - min)) + min;
}

function getJSON(options, onResult) {
    console.log("rest::getJSON");

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            try{
                var obj = JSON.parse(output);
            }catch (err){
                console.log("url = " + req.url )
                console.log("error = " + err)
                var obj = {}
            }
            if( res.statusCode != 200 ){
                console.log(output)
            }
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        console.log(err)
        //res.send('error: ' + err.message);
    });

    req.end();
}

class NewsData{

    static validGenre(genre){
        return genres[genre]
    }

    static search(keyword, callback){
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let option = {
                    sort: {"time": -1}
                }
                let selector = {"has_video": false}
                selector.keywords = new RegExp(keyword)
                selector.title = new RegExp(keyword)
                selector.abstract = new RegExp(keyword)
                //console.log(option)
                db.collection(collection).find(selector, option).toArray(callback)
            }
        })
    }

    static getList(genre, tag, callback, offset, limit){
        if( !offset )
            offset = 0
        if( !limit )
            limit = 10
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let option = {
                    limit: limit,
                    skip: offset,
                    sort: {"time": -1}
                }

                let selector = {"has_video": false}
                if( genre )
                    selector.genre = genre
                else if( tag )
                    selector.keywords = new RegExp(tag)
                //console.log(option)
                db.collection(collection).find(selector, option).toArray(callback)
            }
        })
    }

    static getScrollList(callback){
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let option = {
                    limit: 10,
                    sort: {"time": -1}
                };
                let selector = {
                    "has_video": false,
                    "large_image_url": {
                        $exists : true
                    }
                };
                //console.log(option)
                db.collection(collection).find(selector, option).toArray(callback)
            }
        })
    }

    static getHotComments(callback){
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let option = {
                    limit: 10,
                    sort: {"comments_count": -1}
                };

                let selector = {

                };
                //console.log(option)
                db.collection(collection).find(selector, option).toArray(callback)
            }
        })
    }


    static getContent(id, callback){
        let opt = {
            host: "m.toutiao.com",
            port: 80,
            method: 'GET',
            path: id.replace('/item/', '/i').replace('info/', '') + 'info/',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        console.log("path = " + opt.host + opt.path)
        getJSON(opt, callback)
    }

    static getNews(title, callback, isTitle = true){
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let selector = {}
                if( isTitle )
                    selector.title = title
                else
                    selector._id = ObjectID(title)
                console.log(selector)
                db.collection(collection).findOne(selector, callback)
            }
        })
    }

    static getNewsById(ids, callback){
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let selector = {
                    "_id": {
                        $in: ids
                    }
                };
                let option = {
                    "sort": {"time": -1},
                    limit: 10
                };
                // console.log(selector);
                db.collection(collection).find(selector, option).toArray(callback)
            }
        })
    }

    static getComment(group, item, callback){
        let opt = {
            host: "www.toutiao.com",
            port: 80,
            method: 'GET',
            path: "/api/comment/list/?" + querystring.stringify({
                group_id: group,
                item_id: item
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        getJSON(opt, callback)
    }

    static getModel(callback){
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let option = {
                    "sort": { "time": -1 }
                }
                db.collection("recommendModel").findOne({}, option, callback)
            }
        })
    }
    static getRecommend(id, api, callback){
        let params = {
            // Request parameters
            "includeMetadata": false,
            "buildId": api.buildId,
            "modelId": api.modelId,
            "itemIds": id,
            "numberOfResults": 10,
            "minimalScore": 0.5
        }
        let opt = {
            host: "westus.api.cognitive.microsoft.com",
            port: 443,
            method: 'GET',
            path: "/recommendations/v4.0/models/{modelId}/recommend/item?" + queryParams(params),
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': api.token
            }
        }
        getJSON(opt, callback)
    }
    static getRelated(relatedWords, callback, offset = 0, limit = 10){
        MongoClient.connect(connectStr, function (err, db) {
            if( err ){
                return console.log(err)
            }else{
                let option = {
                    limit: limit,
                    skip: offset,
                    sort: {"time": -1}
                };
                let filter = {
                    "keywords": {
                        "$in": relatedWords
                    }
                };
                let projection = {
                    "title": 1,
                    "time": 1,
                    "imgurls": 1,
                    "genre": 1
                }
                db.collection(collection).find(filter, option).toArray(callback)
            }
        })
    }

    static pushHotNews(){
        console.log("Push hot news to all users");
        NewsData.getList("hot", null, function (err, result) {
            if( err ){
                console.log(err)
            }else if( result.length > 0 ){
                let index = getRandomInt(0, 9)
                oneSignal.sendNotification(result[index].title, {
                    included_segments: ['All'],
                    url: "http://" + config["host"] + ":" + config["port"] + "/news/" + result[index].title,
                    big_picture: result[index].imgurls[0]
                })
            }
        })
    }

}

exports.getJSON = getJSON;

module.exports = NewsData;