import PhantomBase, {
  EVT_READY,
  EVT_UPDATED,
  EVT_DESTROYED,
} from "phantom-base";
import fetchAudioContext from "./fetchAudioContext";

export { EVT_READY, EVT_UPDATED, EVT_DESTROYED };

/**
 * Base class for handling PhantomBase with centralized AudioContext.
 */
export default class PhantomAudioBase extends PhantomBase {
  constructor() {
    super({
      isReady: false,
    });

    this._audioContext = null;

    // Initialize audio context
    (() => {
      fetchAudioContext().then(async audioContext => {
        this._audioContext = audioContext;

        await this.init();

        this._isReady = true;

        this.emit(EVT_READY);
      });
    })();
  }

  /**
   * This should be overridden by whatever initialization is necessary.
   */
  async init() {
    // NOTE (jh): I left this in PhantomAudioBase, vs. PhantomBase due to not
    // running init() automatically in PhantomBase constructor.
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
