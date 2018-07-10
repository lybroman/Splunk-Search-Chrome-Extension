chrome.identity.getProfileUserInfo(function(userInfo) {
    let user_info_url = userInfo.id;
    if (user_info_url){
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", user_info_url, false);
        xmlHttp.send(null);
        let up = JSON.parse(xmlHttp.responseText).entry["gphoto$thumbnail"]["$t"];
        chrome.storage.sync.set({user_profile_photo_url: up}, function () {
        });
        let un = JSON.parse(xmlHttp.responseText).entry["gphoto$nickname"]["$t"];
        chrome.storage.sync.set({user_profile_name: un}, function () {
        });
    }
    else
    {
        // set default if not login
        chrome.storage.sync.set({user_profile_photo_url: '../images/splunk-ninja.png'}, function () {
        });
        chrome.storage.sync.set({user_profile_name: 'splunkie'}, function () {
        });
    }
});