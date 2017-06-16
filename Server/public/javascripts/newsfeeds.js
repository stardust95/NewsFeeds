/**
 * Created by stardust on 2017/5/17.
 */

var offset = 0;
let limit = 10;
let endpoint = "https://westus.api.cognitive.microsoft.com/recommendations/v4.0"
/*
 * Public functions
 * */

function isSuccess(status) {
    return status === "success"
}

function changeButton(type) {
    switch (type){
        case 'load':
            $('#readmoreBtn').prop("disabled", false)
            $('#readmoreBtnText').text("")
            $('.overlay').css("display", "inherit")
            break;
        case 'more':
            $('.overlay').css("display", "none")
            $('#readmoreBtn').prop("disabled", false)
            $('#readmoreBtnText').text("加载更多")
            break;
        case 'end':
            $('.overlay').css("display", "none")
            $('#readmoreBtn').prop("disabled", true)
            $('#readmoreBtnText').text("已无更多")
            break;
    }
}

/*
* Onload functions
* */

function homepageOnload() {
    appendNewsList();
}

function newslistOnload() {
    appendNewsList();

}

function newspageOnload() {
    $.get('/news/content?' + $.param({ id: news.item_seo_url }),
    function (data, status) {
        if( isSuccess(status) ){
            // $('.newscontent').append(data.data.content)
            $(data.data.content).insertBefore('.newscontent .share')
            $('.newscontent img').addClass("img-responsive center-block")
        }
    })
    $.get('/news/comments?' + $.param({ group_id: news.group_id, item_id: news.item_id }),
    function (data, status) {
        if( isSuccess(status) ){
            $('.box-comments').append(data)
        }
    })

    getRelatedNews();
}

function onLoginClick() {

}

function loadContent() {

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
    });
    changeButton('load');
    $.get('/news/list?' + query, (data, status) => {
        // console.log(data)
        if( isSuccess(status) ){
            offset += data.size;
            $(data.html).insertBefore('.loadbutton');
            // $('#main-content').insertBefore(data);
            if( data.size < limit ){
                changeButton('end')
            }else{
                changeButton('more')
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

function getRelatedNews() {
    $.get('/news/related/'+news._id, function (data, status) {
        if( isSuccess(status) ){
            console.log(data);
            $('.wid-post .content').append(data)
        }
    })
}

function uploadUsage() {
    let params = {
        modelId: ""
    }
    let body = {
        "userId": "string",
        "buildId": 0,
        "events": [
            {
                "eventType": "Click",
                "itemId": "string",
                "timestamp": "string",
                "count": 0,
                "unitPrice": 0.0
            }
        ]
    }
    $.ajax({
        url: "https://westus.api.cognitive.microsoft.com/recommendations/v4.0/models/28f64f3a-84a8-4f6d-889b-6c738d284aad/usage/events?"
            + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","62155e00332a4a62afbfe6478c8c9212");
        },
        type: "POST",
        // Request body
        data: body,
    }).done(function(data) {
        console.log("update success")
    }).fail(function() {
        alert("update error");
    });
}

/*
* Content loading functions invoke
* */

loadTags();
