function onresponse(response) {
    // debugger;

    if((response.result === "success" || response.result === "hypothesis") && response.text) {
        var fixedResponse = response.text
            .replace("Dougal", "Google")
            .replace("dougal", "google");

        var ev = {
            resultIndex: 0,
            results: {
                length: 1,
                0: {
                    0: {
                        confidence: response.confidence,
                        transcript: fixedResponse
                    },
                    isFinal: response.result === "success",
                    length: 1
                }
            },
        };

        console.log(ev);

        chrome.tabs.sendMessage(tabId, {
            "message": "onResult",
            "event": ev
        });
    }
    else {
        console.log("Error");
        console.log(response);

        if(response.result === "error" && response.code === 10001) {
            chrome.tabs.create({
                url: chrome.extension.getURL("options.html"),
                selected: true
            });
        }
    }
}

function onstatechange(state) {
    console.log("state changed to " + state);
    chrome.tabs.sendMessage(tabId, {
        message: "recognizerStatus",
        recognizerStatus: state
    });

    // if(state === 0) {
    // 	chrome.runtime.sendMessage({
    // 		message: "indicatorStopASR"
    // 	})
    // }
}

var recognizer = new iSpeechRecognizer({
    apiKey: "d59f54e5da7ba8f1fa52661475488e50",
    silenceDetection: true,
    workerLoc: "../lib/iSpeechWorker.min.js",
    onResponse: onresponse,
    onStateChange: onstatechange
});

recognizer.addOptionalCommand("hypothesis", 1);
recognizer.onStateChange = onstatechange;

var recorder = new Recorder();
var tabId = -1;
var resampler = null;
var codec = null;


function splitData(data) {
    var split = data.length % codec.frame_size;

    return [data.subarray(0, data.length-split), data.subarray(data.length-split, data.length)];
}

function appendData(base, data) {
    var ret = new Int16Array(base.length + data.length);

    for(var i = 0; i < base.length; i++) {
        ret[i] = base[i];
    }

    for(var i = 0; i < data.length; i++) {
        ret[base.length + i] = data[i];
    }

    return ret;
}

function floatTo16BitPCM(output, offset, input){
    for (var i = 0; i < input.length; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

var recordedData = null;
var pcmbuffer = null;
var max = 0, localMax = 0;

recorder.onNewAudio = function(buffer) {
    if(resampler == null) {
        resampler = new Resampler(recorder.context.sampleRate, 16000, 1, 1000000, false);
        // codec = new Speex({mode: 1});
        pcmbuffer = new Int16Array();
        recordedData = [];
        max = 0;
        localMax = 0;
    }

    var floatBuffer = resampler.resampler(buffer);

    var int16buffer = new ArrayBuffer(floatBuffer.length*2);
    var view = new DataView(int16buffer);

    // convert floats to shorts
    floatTo16BitPCM(view, 0, floatBuffer);

    var int16data = new Int16Array(int16buffer);

    // find volume
    localMax = 0;
    for(var i = 0; i < int16data.length; i++) {
        var val = Math.abs(int16data[i]);
        max = (val > max) ? val : max;
        localMax = (val > localMax) ? val : localMax;
    }
    var vol = localMax/max;
    chrome.tabs.sendMessage(tabId, {message: "volumeChange",volume: vol});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // debugger;

    if(request.message == "start") {
        // console.log("Starting...");
        tabId = sender.tab.id;

        recorder.start();
        recognizer.start();
        chrome.tabs.sendMessage(tabId, {
            "message": "setIndicatorRecording"
        });
    } else if(request.message == "stop") {
        recognizer.stop();
        recorder.stop();

        console.log("Stopped recognizer and recorder");

        chrome.tabs.sendMessage(tabId, {
            message: "recognizerStopped"
        });
    }
});

function sendData() {

}

chrome.tabs.onRemoved.addListener( function(tId, removeInfo) {
    if(tId == tabId)
        recognizer.stop();
});
