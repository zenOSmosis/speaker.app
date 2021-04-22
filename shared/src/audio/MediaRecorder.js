import EventEmitter from "events";

export const EVT_OUTPUT_AUDIO_BUFFER = "output-audio-buffer";

// TODO: Extend PhantomAudioBase
class MediaRecorder extends EventEmitter {
  /**
   * The buffer size in units of sample-frames. If specified, the bufferSize
   * must be one of the following values: 256, 512, 1024, 2048, 4096, 8192,
   * 16384. If it's not passed in, or if the value is 0, then the
   * implementation will choose the best buffer size for the given environment,
   * which will be a constant power of 2 throughout the lifetime of the node.
   *
   * This value controls how frequently the audioprocess event is dispatched
   * and how many sample-frames need to be processed each call. Lower values
   * for bufferSize will result in a lower (better) latency. Higher values
   * will be necessary to avoid audio breakup and glitches. It is recommended
   * for authors to not specify this buffer size and allow the implementation
   * to pick a good buffer size to balance between latency and audio quality.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor
   */
  static AUDIO_BUFFER_OUTPUT_SIZE = 1024;

  static NUM_INPUT_CHANNELS = 1;
  static NUM_OUTPUT_CHANNELS = 1;

  constructor(inputStream) {
    super();

    if (!(inputStream instanceof MediaStream)) {
      throw new Error("inputStream must be a MediaStream");
    }

    this._inputStream = inputStream;

    this._audioContext = null;
    this._source = null;
    this._scriptNode = null;

    this._initAudioContext();
  }

  // TODO: Use fetchAudioContext
  _initAudioContext() {
    if (!this._inputStream) {
      console.warn(
        "outputStream is not initialized. Skipping  _initAudioContext",
        this
      );
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    this._audioContext = new AudioContext();

    this._source = this._audioContext.createMediaStreamSource(
      this._inputStream
    );

    // TODO: Read input stream to determine number of input channels
    // The createScriptProcessor() method of the BaseAudioContext interface creates a ScriptProcessorNode used for direct audio processing.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createScriptProcessor
    this._scriptNode = this._audioContext.createScriptProcessor(
      MediaRecorder.AUDIO_BUFFER_OUTPUT_SIZE,
      MediaRecorder.NUM_INPUT_CHANNELS,
      MediaRecorder.NUM_OUTPUT_CHANNELS
    );

    this._source.connect(this._scriptNode);
    this._scriptNode.connect(this._audioContext.destination);

    this._scriptNode.onaudioprocess = (e) => {
      const audioBuffer = e.inputBuffer;

      // Write the audioBuffer to the output
      this.emit(EVT_OUTPUT_AUDIO_BUFFER, audioBuffer);
    };
  }
}

export default MediaRecorder;
