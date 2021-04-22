import PhantomAudioBase, {
  EVT_UPDATED,
  EVT_DESTROYED,
} from "./PhantomAudioBase";

export { EVT_UPDATED, EVT_DESTROYED };

// Instance registration for use with getControllerWithDeviceId
const _instances = {};

/**
 * Utilized for live-manipulation of MediaStream audio.
 *
 * TODO: Set up so that video can passthru this w/o issue.
 *
 * IMPORTANT! This is not currently set up to handle MediaStream instances with
 * video and audio tracks at the same time.
 */
export default class MediaStreamAudioController extends PhantomAudioBase {
  /**
   * Retrieves all instances of audio controller w/ device id.
   *
   * NOTE (jh): This includes the word "audio" in it because I may refactor
   * this w/ a base media controller which audio / video extensions inherit
   * from.
   *
   * @return {MediaStreamAudioController[]}
   */
  static getAudioControllerInstances() {
    return Object.values(_instances);
  }

  /**
   * Used to determine which AudioController instance may be associated with a
   * given capture device id.
   *
   * @param {string} deviceId
   * @return {MediaStreamAudioController | void}
   */
  static getControllerWithDeviceId(deviceId) {
    return Object.values(_instances).find((audioController) => {
      const deviceIds = audioController.getDeviceIds();

      return deviceIds.includes(deviceId);
    });
  }

  /**
   * @param {MediaStream} inputMediaStream In this model, the original media
   * stream is not modified.
   */
  constructor(inputMediaStream) {
    super();

    // TODO: Verify that copying media stream doesn't induce excess CPU load
    this._inputMediaStream = inputMediaStream;

    /**
     * Automatically inferred via init() method.
     *
     * @type {string}
     */
    this._inputDeviceIds = [];

    this._src = null;
    this._dst = null;
    this._gainNode = null;
    this._outputMediaStream = null;

    // Instance registration for use with getControllerWithDeviceId
    (() => {
      _instances[this._uuid] = this;
      this.on(EVT_DESTROYED, () => {
        delete _instances[this._uuid];
      });
    })();

    // Handle cache registration / unregistration
    this.once(EVT_DESTROYED, () => {
      // Stop incoming audio tracks when destroyed
      this._inputMediaStream.getAudioTracks().forEach((audioTrack) => {
        audioTrack.stop();
      });

      // Stop outgoing audio tracks when destroyed
      this._outputMediaStream.getAudioTracks().forEach((audioTrack) => {
        audioTrack.stop();
      });
    });

    // Self-destruct once all incoming audio tracks have ended
    (() => {
      const inputAudioTracks = this._inputMediaStream.getAudioTracks();

      let endedLacking = inputAudioTracks.length;

      inputAudioTracks.forEach((audioTrack) => {
        audioTrack.addEventListener("ended", () => {
          --endedLacking;

          if (endedLacking === 0) {
            this.destroy();
          }
        });
      });
    })();

    this._isInitStarted = false;
  }

  /**
   * @override
   *
   * Automatically called via PhantomAudioBase once init.
   */
  async init() {
    // Prevent duplicate inits
    if (this._isInitStarted) {
      console.warn(`Init has already started for ${this.getClassName()}`);

      return;
    }

    this._isInitStarted = true;

    // Audio context should already be available as result of PhantomAudioBase
    // init
    const ctx = this.getAudioContext();
    if (!ctx) {
      throw new Error("AudioContext is not available");
    }

    const inputMediaStream = this._inputMediaStream;

    const inputAudioTracks = inputMediaStream.getAudioTracks();

    /**
     * Automatically inferred.
     *
     * @type {string[]}
     * */
    this._inputDeviceIds = (() => {
      const inputAudioTracks = this._inputMediaStream.getAudioTracks();

      return inputAudioTracks.map((audioTrack) => {
        const { deviceId } = audioTrack.getConstraints();

        return deviceId && deviceId.exact;
      });
    })();

    if (!inputAudioTracks.length) {
      // No audio processing is available; copy input media stream to
      // output media stream, as is
      this._outputMediaStream = new MediaStream(inputMediaStream);
      return;
    }

    this._src = ctx.createMediaStreamSource(new MediaStream(inputAudioTracks));
    this._dst = ctx.createMediaStreamDestination();
    this._gainNode = ctx.createGain();

    this._src.connect(this._gainNode);
    this._gainNode.connect(this._dst);

    this._outputMediaStream = this._dst.stream;

    this._isMuted = false;

    // The gain level when unmuted
    this._unmutedGain = 1;
  }

  /**
   * Returns an array of all device ids associated with the input tracks.
   *
   * IMPORTANT: This controller instance must be fully initialized before this
   * is populated.
   *
   * @return {string[]}
   */
  getDeviceIds() {
    return this._inputDeviceIds;
  }

  // TODO: Add stereo panner
  // https://stackoverflow.com/questions/5123844/change-left-right-balance-on-playing-audio-in-javascript?rq=1
  //    - default pan set to 0 - center
  //    - const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });

  /**
   * @param {boolean} isMuted
   */
  setIsMuted(isMuted) {
    this._isMuted = isMuted;

    this._gainNode.gain.value = isMuted ? 0 : this._unmutedGain;

    this.emit(EVT_UPDATED);
  }

  /**
   * Sets muting state to alternate state.
   */
  toggleMute() {
    this.setIsMuted(!this._isMuted);
  }

  /**
   * @return {boolean}
   */
  getIsMuted() {
    return this._isMuted;
  }

  /**
   * @return {MediaStream | void}
   */
  getOutputMediaStream() {
    if (!this._isReady) {
      throw new Error("MediaStreamAudioController is not ready");
    }

    return this._outputMediaStream;
  }

  /**
   * @return {MediaStreamTrack[]}
   */
  getOutputMediaStreamAudioTracks() {
    const mediaStream = this.getOutputMediaStream();

    const mediaStreamTracks = mediaStream.getAudioTracks();

    return mediaStreamTracks;
  }

  /**
   * A number from 1 - 10.
   *
   * @param {number} gain
   */
  setGain(gain) {
    this._unmutedGain = gain;

    if (!this._isReady) {
      throw new Error("MediaStreamAudioController is not ready");
    }

    if (this._gainNode) {
      this._gainNode.gain.value = gain;
    }

    this.emit(EVT_UPDATED);
  }

  /**
   * A number from 1 - 10.
   *
   * @return {number}
   */
  getGain() {
    if (!this._isReady) {
      throw new Error("MediaStreamAudioController is not ready");
    }

    return this._gainNode && this._gainNode.gain && this._gainNode.gain.value;
  }
}
