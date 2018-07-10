chrome.runtime.onInstalled.addListener(function() {

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
});

chrome.runtime.onStartup.addListener(function() {
    chrome.storage.sync.set({convert_color: false}, function() {
    });
});