Recorder = function() {
    window.navigator = window.navigator || {};
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia	||
        null;
    if (navigator.getUserMedia === null) {
        this.onError("NotSupportedError");
        return;
    }
    this.audioContext = null;
}

Recorder.prototype.start = function() {
    navigator.getUserMedia({
            video: false,
            audio: true
        }, this.startRecording.bind(this),
        function(error) {
            this.onError(error.name);
        }.bind(this));
}

Recorder.prototype.startRecording = function(localMediaStream) {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

    this.mediaStream = localMediaStream; // save the stream for later

    this.mediaStream.stop = function() {
        for(var i = 0; i < this.getAudioTracks().length; i++) {
            this.getAudioTracks()[i].stop();
        }
    }.bind(this.mediaStream);

    var source = this.audioContext.createMediaStreamSource(localMediaStream); // get the source

    this.context = source.context;
    this.node = (this.context.createScriptProcessor ||
        this.context.createJavaScriptNode).call(this.context, 8192, 1, 1); // get the node with a buffer of 4096 and one input/output channel

    this.node.onaudioprocess = this.processAudio.bind(this); // set the onaudioprocess
    source.connect(this.node); // connect the node to the source
    this.node.connect(this.context.destination);    //this should not be necessary

    this.onStart();
}

Recorder.prototype.onError = function(e){}

Recorder.prototype.processAudio = function(e) {
    var buffer = [];
    buffer = e.inputBuffer.getChannelData(0);
    this.onNewAudio(buffer);
}

Recorder.prototype.onStart = function(){}

Recorder.prototype.onNewAudio = function(buffer) {
    console.log(buffer);
}

Recorder.prototype.stop = function() {
    this.mediaStream.stop();
    this.node.disconnect();
    this.node.onaudioprocess = function(){};

    this.audioContext.close();
    this.context.close();
}