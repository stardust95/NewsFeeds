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

function login() {

}

function register() {
    $.post('/users/register', {
        'name': $('input[type=text]')[0].value,
        'email': $('input[type=email]')[0].value,
        'password': $('input[type=password]')[0].value
    }, function (data, status) {
        if( isSuccess(status) ) {
            if( data.success ){

            } else {
                alert(data.message)
            }
        }else{
            console.log('status = ' + status)
        }
    })
}

// TODO: $.get query?
function appendNewsList() {
    $.get('/news/list/' + genre + "?html=1" + "&offset=" + offset + "&limit=" + limit, (data, status) => {
        // console.log(data)
        if( isSuccess(status) ){
            offset += 10;
            $(data).insertBefore('.loadbutton');
            // $('#main-content').insertBefore(data);
        }
    })
}


