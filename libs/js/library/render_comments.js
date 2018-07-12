const g_pony_comment =
    '<div class="clearfix custom_comment" style="margin-left: 2px">' +
    '<div class="ui comments" style="text-align:left">' +
        '<div class="comment">' +
            '<a class="avatar">' +
                '<img src="../images/ninja-intern.png">' +
            '</a>' +
            '<div class="content">' +
                '<a class="author" style="font-family: Montserrat; font-size: 0.7em">Ninja Intern</a>' +
                '<div class="text {{shuffle}}" style="font-size: 0.9em">' +
                    '{{arg_pony_comment}}' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '</div>';

const g_user_comment =
    '<div class="clearfix custom_comment" style="margin-right: 10px">' +
    '<div class="ui comments" style="text-align:right;">' +
        '<div class="comment">' +
            '<a class="avatar" style="float:right; margin-left:14px;">' +
                '<img src="{{arg_user_profile_photo}}">' +
            '</a>' +
            '<div class="content" style="float:right;">' +
                '<a class="author" style="font-family: Montserrat; font-size: 0.7em;">{{arg_user_name}}</a>' +
                '<div class="text {{shuffle}}" style="font-size: 0.9em">' +
                    '{{arg_user_comment}}' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '</div>';

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function show_comment_div(height="250px"){
    const c_div = document.getElementById("comments");
    c_div.style.height = height;
    $("#comments").show(0.5)
    //c_div.style.transition = "all 0.5s";
}

function update_comment(user_comment, pony_comment) {

    chrome.storage.sync.get(['user_profile_photo_url', 'user_profile_name'], function (obj) {
        let up = obj.user_profile_photo_url;
        let un = obj.user_profile_name;
        let uid = guid();
        let user_comment_html = g_user_comment.replace('{{arg_user_profile_photo}}', up)
            .replace('{{arg_user_name}}', un)
            .replace('{{arg_user_comment}}', user_comment);
            //.replace('{{shuffle}}', uid);
        let pony_comment_html = g_pony_comment.replace('{{arg_pony_comment}}', pony_comment)
            .replace('{{shuffle}}', uid);
        // let all = user_comment_html + pony_comment_html;
        let all = pony_comment_html;
        let cmts = $("#comments");
        cmts.append(all);
        const c_div = document.getElementById("comments");
        c_div.scrollTop = c_div.scrollHeight;
        $('.' + uid).shuffleLetters();
    });
}

function set_aloha_status(b_on){
    if(b_on){
        //let ai = $("#aloha_icon");
        //ai.removeClass('male');
        //ai.addClass('child');
        let as = $("#aloha_status");
        as.text("I'm here!")
    }
    else
    {
        //let ai = $("#aloha_icon");
        //ai.removeClass('child');
        //ai.addClass('male');
        let as = $("#aloha_status");
        as.text('Activate me with "Aloha" !')
    }
}



