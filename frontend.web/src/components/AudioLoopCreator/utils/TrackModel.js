import EventEmitter from "events";
import { v4 as uuidv4 } from "uuid";

export const EVT_UPDATED = "updated";

// TODO: Extend PhantomBase?
export default class TrackModel extends EventEmitter {
  // TODO: Rename?
  static _beatHandler = (beatIdx) => console.warn("No beat handler installed");

  static setBeatHandler(beatHandler) {
    TrackModel._beatHandler = beatHandler;
  }

  constructor({ instrument, trackName, trackId }) {
    super();

    this._id = trackId || uuidv4();

    this._beatTimeIndexes = [];
    this._trackName = trackName || (instrument && instrument.name);
    this._instrument = instrument;

    this._currentBeatIdx = null;

    // TODO: Remove
    /*
    this.on(EVT_UPDATED, () => {
      console.debug({
        beatTimeIndexes: this._beatTimeIndexes,
      });
    });
    */
  }

  /**
   * @return {string}
   */
  getId() {
    return this._id;
  }

  /**
   * @param {string} name
   */
  setName(name) {
    this._trackName = name;
    this.emit(EVT_UPDATED);
  }

  /**
   * @return {string}
   */
  getName() {
    return this._trackName;
  }

  /**
   * @param {number} instrumentId
   */
  /*
  setInstrumentId(instrumentId) {
    // TODO: Ensure this is a valid instrument id
    // this._instrumentId = instrumentId;

    this.emit(EVT_UPDATED);
  }
  */

  /**
   * @return {number}
   */
  getInstrumentId() {
    return this._instrument && this._instrument.id;
  }

  /**
   * @return {string}
   */
  getInstrumentName() {
    return this._instrument && this._instrument.name;
  }

  /**
   * @param {number} idx
   */
  addBeatTimeIdx(idx) {
    if (!this._beatTimeIndexes.includes(idx)) {
      this._beatTimeIndexes.push(idx);

      this.emit(EVT_UPDATED);
    }
  }

  /**
   *
   * @param {number} idx
   */
  removeBeatTimeIdx(idx) {
    const pos = this._beatTimeIndexes.indexOf(idx);

    if (pos > -1) {
      this._beatTimeIndexes.splice(pos, 1);

      this.emit(EVT_UPDATED);
    }
  }

  /**
   * @param {number} idx
   * @return {boolean}
   */
  getHasBeatTimeIdx(idx) {
    return this._beatTimeIndexes.includes(idx);
  }

  /**
   * @return {number[]}
   */
  getBeatTimeIndexes() {
    return this._beatTimeIndexes;
  }

  toggleRegisterBeatTimeIdx(idx) {
    if (this.getHasBeatTimeIdx(idx)) {
      this.removeBeatTimeIdx(idx);
    } else {
      this.addBeatTimeIdx(idx);
    }
  }

  setCurrentBeatIdx(idx) {
    if (idx === this._currentBeatIdx) {
      return;
    }

    this._currentBeatIdx = idx;

    const instrumentId = this._instrument && this._instrument.id;

    if (this.getHasBeatTimeIdx(idx)) {
      TrackModel._beatHandler({ instrumentId });
    }
  }
}
