var synth = window.speechSynthesis;

var voice_comment = function (comment) {
    let utterThis = new SpeechSynthesisUtterance(comment);
    synth.speak(utterThis);
}