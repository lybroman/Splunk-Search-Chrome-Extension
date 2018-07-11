let highlight_check_box = document.getElementById('convert_color');
let audio_recorder = document.getElementById('recorder');
let started=false;
let bshow=false;
let recognition;
let b_highlight = false;
var SW;

// Move this part to somewhere else later

function get_key_words() {
    urls = {
        "indexes": "http://localhost:8000/en-US/splunkd/__raw/services/data/indexes?output_mode=json&count=-1",
        "sourcetypes": "http://localhost:8000/en-US/splunkd/__raw/services/saved/sourcetypes?output_mode=json&count=-1"
    }
    result = {}
    for (key in urls) {
        $.getJSON({
            url: urls[key],
            success: function(data){
                values = []
                for (idx in data["entry"]) {
                    values.push(data["entry"][idx]["name"])
                }
                result[key] = values;
            },
            async: false
        })
    }
    return result;
}


audio_recorder.onclick = function() {
    if(!started) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            started = true;
            //document.getElementById("status").innerHTML = "start";
            SW.start();
            set_aloha_status(true);
        };

        recognition.onerror = function (event) {
            alert(event.error)
            started = false;
            SW.stop();
            set_aloha_status(false);
            //started = true;
            //document.getElementById("status").innerHTML = "start";
            //recognition.start();
        };

        recognition.onend = function () {
            //document.getElementById("status").innerHTML = "end";
            started = false;
            SW.stop();
            set_aloha_status(false);
            //started = true;
            //document.getElementById("status").innerHTML = "start";
            //recognition.start();
        };

        recognition.onresult = function (event) {
            let final_transcript = '';

            SW.stop();
            set_aloha_status(false);
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                final_transcript += event.results[i][0].transcript;
            }

            if (final_transcript.trim().length > 0) {
                let newURL = "http://localhost:8000/en-US/app/search/search?earliest=0&latest=&q=search%20" +
                    final_transcript +
                    "&display.page.search.mode=smart&dispatch.sample_ratio=1";

                /*
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var tab = tabs[0];
                    chrome.tabs.update(tab.id, {url: newURL});
                });
                // chrome.tabs.create({ url: newURL });
                */

                // TODO
                // interim_transcript -> update current SPL data structure
                //document.getElementById("show_text").innerHTML = final_transcript;

                // TODO: @lwei please porting this method call to correct position
                if (!bshow){
                    show_comment_div();
                    bshow = false;
                }
                update_comment(final_transcript, "just dummy comment...");
                voice_comment("just dummy comment");
            }

        };
        recognition.start();
    }
    else
    {
        recognition.stop();
    }
};

highlight_check_box.onclick  = function() {

    chrome.storage.sync.set({convert_color: !b_highlight}, function() {
        let icon_highlight = $('#convert_color');
        if (icon_highlight.hasClass('off')) {
            icon_highlight.removeClass('off');
            icon_highlight.addClass('on');
        }
        else
        {
            icon_highlight.addClass('off');
            icon_highlight.removeClass('on')
        }
        b_highlight = !b_highlight;
    });


    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.executeScript(tab.id, {
            code : 'render()'
        }, function() {});
    });
};

$(function() {
    chrome.storage.sync.get('convert_color', function (obj) {
        let icon_highlight = $('#convert_color');
        if(obj.convert_color){
            icon_highlight.removeClass('off');
            icon_highlight.addClass('on');
        }
        b_highlight = obj.convert_color;
    });

    SW = new SiriWave({
        width: 40,
        height: 15,
        speed: 0.05,
        amplitude: 1,
        //style: "ios9",
        container: document.getElementById('siric'),
        autostart: false,
        color: "#000"
    });
});