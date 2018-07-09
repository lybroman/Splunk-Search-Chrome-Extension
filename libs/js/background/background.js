chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({convert_color: false}, function() {
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'localhost'},
            }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: '127.0.0.1'},
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });

    chrome.identity.getProfileUserInfo(function(userInfo) {
        let user_info_url = "http://picasaweb.google.com/data/entry/api/user/" + "117726327892945278137" + "?alt=json";
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", user_info_url, false);
        xmlHttp.send(null);
        let up = JSON.parse(xmlHttp.responseText).entry["gphoto$thumbnail"]["$t"];
        chrome.storage.sync.set({user_profile_photo_url: up }, function() {
        });
        let un = JSON.parse(xmlHttp.responseText).entry["gphoto$nickname"]["$t"];
        chrome.storage.sync.set({user_profile_name: un }, function() {
        });
    });
});