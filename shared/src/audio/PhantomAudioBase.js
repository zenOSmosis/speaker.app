import PhantomCore, {
  EVT_READY,
  EVT_UPDATED,
  EVT_DESTROYED,
} from "phantom-core";
import fetchAudioContext from "./fetchAudioContext";

export { EVT_READY, EVT_UPDATED, EVT_DESTROYED };

/**
 * Base class for handling PhantomCore with centralized AudioContext.
 */
export default class PhantomAudioBase extends PhantomCore {
  constructor() {
    super({
      isReady: false,
    });

    this._audioContext = null;

    // Initialize audio context
    (() => {
      fetchAudioContext().then(async audioContext => {
        this._audioContext = audioContext;

        await this._init();
      });
    })();
  }

  /**
   * IMPORTANT: If this instance is not ready with the fetched audio context,
   * this will return null.
   *
   * @return {AudioContext | null}
   */
  getAudioContext() {
    return this._audioContext;
  }
}
