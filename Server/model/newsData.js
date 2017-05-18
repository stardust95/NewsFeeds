/**
 * Created by stardust on 2017/5/17.
 */

var MongoClient = require('mongodb').MongoClient;
var config = require('./config');

let dbname = "news";

let genres = config["genres"];
let connectStr = config["connect"]

class NewsData{

    static validGenre(genre){
        return genres[genre]
    }

    static getList(genre, callback, offset, limit){
        if( !offset )
            offset = 0
        if( !limit )
            limit = 10
        MongoClient.connect(connectStr, function (err, db) {
            let option = {
                limit: limit,
                skip: offset,
                sort: ["time"]
            }
            db.collection(genre).find({"has_video": false}, option).toArray(callback)
        })
    }

}

module.exports = NewsData