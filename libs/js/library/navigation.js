let base_url = "http://localhost:8000/en-US/app/search/";
var navigate_to = function(sentences) {
    let words = sentences.split(' ');
    let target_url = "";
    let codes = Array.from(new Array(words.length), (val, index) => soundex(words[index]));
    let key_code = "";
    let b_new = false;

    if (codes.includes(soundex("find"))) {
        key_code = soundex("find");
        b_new = true;
    }
    else if(codes.includes(soundex("open"))){
        key_code = soundex("open");
        b_new = true;
    }
    else if(codes.includes(soundex("go"))){
        key_code = soundex("go");
        b_new = false;
    }
    else if(codes.includes(soundex("to"))){
        key_code = soundex("to");
        b_new = false;
    }

    if (key_code){
        let codes_trailing_segment = codes.slice(codes.indexOf(key_code) + 1);
        if (codes_trailing_segment.includes(soundex("search"))) {
            target_url = base_url + 'search';
        }
        if (codes_trailing_segment.includes(soundex("dashboard"))) {
            target_url = base_url + 'dashboards';
        }
        else if (codes_trailing_segment.includes(soundex("report"))) {
            target_url = base_url + 'reports';
        }
        else if (codes_trailing_segment.includes(soundex("alert"))) {
            target_url = base_url + 'alerts';
        }
        else if (codes_trailing_segment.includes(soundex("data"))) {
            target_url = base_url + 'datasets';
        }

        if (target_url) {

            if(!b_new) {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    var tab = tabs[0];
                    chrome.tabs.update(tab.id, {url: target_url});
                });
            }
            else{
                chrome.tabs.create({ url: target_url });
            }
        }
    }
};