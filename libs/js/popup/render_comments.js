const g_pony_comment =
    '<div class="clearfix" style="margin-left: 10px">' +
    '<div class="ui comments" style="text-align:left">' +
        '<div class="comment">' +
            '<a class="avatar">' +
                '<img src="../images/splunk-pony.png">' +
            '</a>' +
            '<div class="content">' +
                '<a class="author">Pony</a>' +
                '<div class="text">' +
                    '{{arg_pony_comment}}' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '</div>';

const g_user_comment =
    '<div class="clearfix" style="margin-right: 10px">' +
    '<div class="ui comments" style="text-align:right;">' +
        '<div class="comment">' +
            '<a class="avatar" style="float:right; margin-left:14px;">' +
                '<img src="{{arg_user_profile_photo}}">' +
            '</a>' +
            '<div class="content" style="float:right;">' +
                '<a class="author">{{arg_user_name}}</a>' +
                '<div class="text">' +
                    '{{arg_user_comment}}' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '</div>';

function show_comment_div(height="350px"){
    const c_div = document.getElementById("comments");
    c_div.style.height = height;
    c_div.style.transition = "all 0.5s";
}

function update_comment(user_comment, pony_comment) {

    chrome.storage.sync.get(['user_profile_photo_url', 'user_profile_name'], function (obj) {
        let up = obj.user_profile_photo_url;
        let un = obj.user_profile_name;
        let user_comment_html = g_user_comment.replace('{{arg_user_profile_photo}}', up)
            .replace('{{arg_user_name}}', un)
            .replace('{{arg_user_comment}}', user_comment);
        let pony_comment_html = g_pony_comment.replace('{{arg_pony_comment}}', pony_comment);
        let all = user_comment_html + pony_comment_html;
        $("#comments").append(all);
        const c_div = document.getElementById("comments");
        c_div.scrollTop = c_div.scrollHeight;
    });
}



