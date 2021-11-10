import VirtualParticipant from "./VirtualParticipant";

const _instances = {};

/**
 * A virtual participant from the perspective of the transcoder.
 */
export default class TranscoderVirtualParticipant extends VirtualParticipant {
  /**
   * @param {string} socketID
   * @returns {VirtualParticipant}
   */
  static getInstanceWithSocketID(socketID) {
    for (const p of Object.values(_instances)) {
      const testId = p.getSocketID();

      if (testId === socketID) {
        return p;
      }
    }
  }

  /**
   * @param {string} deviceAddress
   * @param {string} socketID
   * @param {Object} rest? [optional; default = {}] The this value is passed to
   * the super VirtualParticipant class.
   */
  constructor(deviceAddress, socketID, rest = {}) {
    if (!deviceAddress) {
      throw new Error("deviceAddress must be defined");
    }

    if (!socketID) {
      throw new Error("initialSocketID must be defined");
    }

    super({ ...rest });

    this._deviceAddress = deviceAddress;
    this._socketID = socketID;

    _instances[this._deviceAddress] = this;
  }

  /**
   * @return {string[]}
   */
  getSocketID() {
    return this._socketID;
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    delete _instances[this._deviceAddress];

    await super.destroy();
  }
}
