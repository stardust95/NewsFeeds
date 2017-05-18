/**
 * Created by stardust on 2017/5/17.
 */


function onload() {
    appendNewsList();
}

function isSuccess(status) {
    return status === "success"
}

function appendNewsList() {
    $.get('/news/list/' + genre + "?html=1", (data, status) => {
        console.log(data)
        if( isSuccess(status) ){
            $('#main-content').append(data);
        }
    })
}
