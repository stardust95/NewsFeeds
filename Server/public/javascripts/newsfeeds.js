/**
 * Created by stardust on 2017/5/17.
 */

var offset = 0;
let limit = 10;


function mewslistOnload() {
    appendNewsList();
}

function isSuccess(status) {
    return status === "success"
}

function onLoginClick() {

}


function loadContent() {
    $.get('http://m.toutiao.com/i6364969235889783298/info/', function (data, status) {
        console.log(data)
    })
}


function onRegisterClick() {
    $.post('/users/register', {
        'fullname': $('input[type=text]')[0].value,
        'email': $('input[type=email]')[0].value,
        'password': $('input[type=password]')[0].value
    }, function (data, status) {
        if( isSuccess(status) ){
            document.open()
            document.write(data)
            document.close()
        }
    })
}

// TODO: $.get query?
function appendNewsList() {
    let query = $.param({
        html: 1,
        offset: offset,
        limit: limit,
        genre: genre,
        tag: tag
    })
    $.get('/news/list?' + query, (data, status) => {
        // console.log(data)
        if( isSuccess(status) ){
            offset += data.size;
            $(data.html).insertBefore('.loadbutton');
            // $('#main-content').insertBefore(data);
            if( data.size < limit ){
                $('#readmoreBtn').prop("disabled", true)
                $('#readmoreBtn').text("已无更多")
            }
        }
    })
}

/*
 *
 * Content loading functions definition
 *
 * */
function loadTags() {
    $.get('/news/tags', function (data, status) {
        if( isSuccess(status) ){
            for(let i=0; i<data.length && i < 10; i++){
                $('.tagscontent').append("<a href='/tag/"+ data[i] + "'>" + data[i] + "</a>")
            }
        }
    })
}

function loadComments(news) {
    if( news ){

        $.get('/news/comments?' + $.param({
                group: news.group_id,
                item: news.item_id
            }), function (data, status) {
            if( isSuccess(status) ){

            }
        })
    }
}

function hotComments() {

}



/*
* Content loading functions invoke
* */

loadTags();
