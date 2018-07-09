let highlight_check_box = document.getElementById('convert_color');
let audio_recorder = document.getElementById('recorder');
let started=false;
let recognition;

audio_recorder.onclick = function() {
    if(!started) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            started = true;
            document.getElementById("status").innerHTML = "start";
        };

        recognition.onerror = function (event) {
            alert(event.error)
            started = false;
        };

        recognition.onend = function () {
            document.getElementById("status").innerHTML = "end";
            started = false;
        };

        recognition.onresult = function (event) {
            let final_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                final_transcript += event.results[i][0].transcript;
            }

            if (final_transcript.trim().length > 0) {
                let newURL = "http://localhost:8000/en-US/app/search/search?earliest=0&latest=&q=search%20" +
                    final_transcript +
                    "&display.page.search.mode=smart&dispatch.sample_ratio=1";

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var tab = tabs[0];
                    chrome.tabs.update(tab.id, {url: newURL});
                });
                // chrome.tabs.create({ url: newURL });

                // TODO
                // interim_transcript -> update current SPL data structure
                document.getElementById("show_text").innerHTML = final_transcript;
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

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.executeScript(tab.id, {
            code : 'render()'
        }, function() {});
    });
};

$(function() {
    chrome.storage.sync.get('convert_color', function (obj) {
        $("#convert_color").prop('checked', obj.convert_color)
    });
});