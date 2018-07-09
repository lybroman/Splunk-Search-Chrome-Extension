//JavaScript Audio Resampler (c) 2011 - Grant Galitz
function Resampler(fromSampleRate, toSampleRate, channels, outputBufferSize, noReturn) {
    this.fromSampleRate = fromSampleRate;
    this.toSampleRate = toSampleRate;
    this.channels = channels | 0;
    this.outputBufferSize = outputBufferSize;
    this.noReturn = !!noReturn;
    this.initialize();
}
Resampler.prototype.initialize = function () {
    //Perform some checks:
    if (this.fromSampleRate > 0 && this.toSampleRate > 0 && this.channels > 0) {
        if (this.fromSampleRate == this.toSampleRate) {
            //Setup a resampler bypass:
            this.resampler = this.bypassResampler;		//Resampler just returns what was passed through.
            this.ratioWeight = 1;
        }
        else {
            this.ratioWeight = this.fromSampleRate / this.toSampleRate;
            if (this.fromSampleRate < this.toSampleRate) {
                /*
                    Use generic linear interpolation if upsampling,
                    as linear interpolation produces a gradient that we want
                    and works fine with two input sample points per output in this case.
                */
                this.compileLinearInterpolationFunction();
                this.lastWeight = 1;
            }
            else {
                /*
                    Custom resampler I wrote that doesn't skip samples
                    like standard linear interpolation in high downsampling.
                    This is more accurate than linear interpolation on downsampling.
                */
                this.compileMultiTapFunction();
                this.tailExists = false;
                this.lastWeight = 0;
            }
            this.initializeBuffers();
        }
    }
    else {
        throw(new Error("Invalid settings specified for the resampler."));
    }
}
Resampler.prototype.compileLinearInterpolationFunction = function () {
    this.resampler = function(buffer, upTo) {
        var bufferLength = buffer.length;
        var outLength = this.outputBufferSize;
        if ((bufferLength % this.channels) == 0) {
            if (bufferLength > 0) {
                var weight = this.lastWeight;
                var firstWeight = 0;
                var secondWeight = 0;
                var sourceOffset = 0;
                var outputOffset = 0;
                var outputBuffer = this.outputBuffer;
                for (; weight < 1; weight += this.ratioWeight) {
                    secondWeight = weight % 1;
                    firstWeight = 1 - secondWeight;
                    for(var channel = 0; channel < this.channels; channel++) {
                        outputBuffer[outputOffset++] = (this.lastOutput[channel] * firstWeight) + (buffer[channel] * secondWeight);
                    }
                }
                weight -= 1;
                for (bufferLength -= this.channels, sourceOffset = Math.floor(weight) * this.channels; outputOffset < outLength && sourceOffset < bufferLength;) {
                    secondWeight = weight % 1;
                    firstWeight = 1 - secondWeight;
                    for(var channel = 0; channel < this.channels; channel++) {
                        outputBuffer[outputOffset++] = (buffer[sourceOffset + channel] * firstWeight) + (buffer[sourceOffset + (this.channels + channel)] * secondWeight);
                    }
                    weight += this.ratioWeight;
                    sourceOffset = Math.floor(weight) * this.channels;
                }
                for(var channel = 0; channel < this.channel; channel++) {
                    this.lastOutput[channel] = buffer[sourceOffset++];
                }
                this.lastWeight = weight % 1;
                return this.bufferSlice(outputOffset);
            } else {
                return (this.noReturn) ? 0 : [];
            }
        } else {
            throw (new Error("Buffer was of incorrect sample length."));
        }
    };
}
Resampler.prototype.compileMultiTapFunction = function () {
    this.resampler = function(buffer, upTo) {
        var bufferLength = buffer.length;
        var outLength = this.outputBufferSize;
        if ((bufferLength % this.channels) == 0) {
            if (bufferLength > 0) {
                var weight = 0;
                var output = new Array(this.channels);
                var actualPosition = 0;
                var amountToNext = 0;
                var alreadyProcessedTail = !this.tailExists;
                this.tailExists = false;
                var outputBuffer = this.outputBuffer;
                var outputOffset = 0;
                var currentPosition = 0;
                do {
                    if (alreadyProcessedTail) {
                        weight = 3;
                        for(var channel = 0; channel < this.channels; channel++) {
                            output[channel] = 0;
                        }
                    } else {
                        weight = this.lastWeight;
                        for(var channel = 0; channel < this.channels; channel++) {
                            output[channel] = this.lastOutput[channel];
                        }
                        alreadyProcessedTail = true;
                    }
                    while (weight > 0 && actualPosition < bufferLength) {
                        amountToNext = 1 + actualPosition - currentPosition;
                        if (weight >= amountToNext) {
                            for(var channel = 0; channel < this.channels; channel++) {
                                output[channel] += buffer[actualPosition++] * amountToNext;
                            }
                            currentPosition = actualPosition;
                            weight -= amountToNext;
                        } else {
                            for(var channel = 0; channel < this.channels; channel++) {
                                output[channel] += buffer[actualPosition+channel] * weight;
                            }
                            currentPosition += weight;
                            weight = 0;
                            break;
                        }
                    }
                    if (weight <= 0) {
                        for(var channel = 0; channel < this.channels; channel++) {
                            outputBuffer[outputOffset++] = output[channel] / 3;
                        }
                    } else {
                        this.lastWeight = weight;
                        this.lastOutput = output;
                        this.tailExists = true;
                        break;
                    }
                } while (actualPosition < bufferLength && outputOffset < outLength);
                return this.bufferSlice(outputOffset);
            } else {
                return (this.noReturn) ? 0 : [];
            }
        } else {
            throw (new Error("Buffer was of incorrect sample length."));
        }
    };
}
Resampler.prototype.bypassResampler = function (buffer) {
    if (this.noReturn) {
        //Set the buffer passed as our own, as we don't need to resample it:
        this.outputBuffer = buffer;
        return buffer.length;
    }
    else {
        //Just return the buffer passsed:
        return buffer;
    }
}
Resampler.prototype.bufferSlice = function (sliceAmount) {
    if (this.noReturn) {
        //If we're going to access the properties directly from this object:
        return sliceAmount;
    }
    else {
        //Typed array and normal array buffer section referencing:
        try {
            return this.outputBuffer.subarray(0, sliceAmount);
        }
        catch (error) {
            try {
                //Regular array pass:
                this.outputBuffer.length = sliceAmount;
                return this.outputBuffer;
            }
            catch (error) {
                //Nightly Firefox 4 used to have the subarray function named as slice:
                return this.outputBuffer.slice(0, sliceAmount);
            }
        }
    }
}
Resampler.prototype.initializeBuffers = function () {
    //Initialize the internal buffer:
    try {
        this.outputBuffer = new Float32Array(this.outputBufferSize);
        this.lastOutput = new Float32Array(this.channels);
    }
    catch (error) {
        this.outputBuffer = [];
        this.lastOutput = [];
    }
}