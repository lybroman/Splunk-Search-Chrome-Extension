let highlight_check_box = document.getElementById('convert_color');
let audio_recorder = document.getElementById('recorder');
let started=false;
let final_transcript = '';
let recognition;

audio_recorder.onclick = function() {
    if(!started) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = function () {
            started = true;
        };

        recognition.onerror = function (event) {
            alert(event.error)
            started = false;
        };

        recognition.onend = function () {
            started = false;
        };

        recognition.onresult = function (event) {
            let interim_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }

            if (final_transcript.trim().length > 0) {
                alert(final_transcript)
                /* Solution 1:
                 * After some processing, directly open an url
                 */
                let _ = processText()
                var newURL = "http://localhost:8000/en-US/app/search/" +
                    "search?earliest=0&latest=&q=search%20index%3D*%20source%3D%22linux_s_30day.log%22" +
                    "%20failed%20OR%20invalid&sid=1531064001.3498&display.page.search.mode=smart&dispatch.sample_ratio=1";
                //chrome.tabs.create({ url: newURL });

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var tab = tabs[0];
                    chrome.tabs.update(tab.id, {url: newURL});
                });
                final_transcript = "";
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
    chrome.storage.sync.set({convert_color: $("#convert_color").prop('checked')}, function() {
    });
    chrome.tabs.executeScript({file: 'inject_render.js'});
};

$(function() {

    chrome.storage.sync.get('convert_color', function (obj) {
        $("#convert_color").prop('checked', obj.convert_color)
    });
});