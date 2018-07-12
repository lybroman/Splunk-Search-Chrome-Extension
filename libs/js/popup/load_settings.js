chrome.identity.getProfileUserInfo(function(userInfo) {
    let user_info_url = "http://picasaweb.google.com/data/entry/api/user/" +  userInfo.id + "?alt=json";
    if (user_info_url){
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", user_info_url, false);
        xmlHttp.send(null);
        let up = JSON.parse(xmlHttp.responseText).entry["gphoto$thumbnail"]["$t"];
        let un = JSON.parse(xmlHttp.responseText).entry["gphoto$nickname"]["$t"];

        if(up && un){
            chrome.storage.sync.set({user_profile_photo_url: up}, function () {
            });

            chrome.storage.sync.set({user_profile_name: un}, function () {
            });
        }
        else{
            // set default if not login
            chrome.storage.sync.set({user_profile_photo_url: '../images/splunk-ninja.png'}, function () {
            });
            chrome.storage.sync.set({user_profile_name: 'splunkie'}, function () {
            });
        }
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