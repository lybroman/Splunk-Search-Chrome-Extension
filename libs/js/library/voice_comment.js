var synth = window.speechSynthesis;
var forever_utterances;
var voice_comment = function (comment) {
    let utterThis = new SpeechSynthesisUtterance(comment);
    forever_utterances = utterThis;
    synth.speak(utterThis);
    utterThis.onend = function(event) {
        setTimeout(function () {
            recognition.start();
            started = true;
        }, 700);
    }
    utterThis.onerror = function(event) {
        recognition.start();
    }
}