import VirtualParticipant from "./VirtualParticipant";

const _instances = {};

/**
 * A virtual participant from the perspective of the transcoder.
 */
export default class TranscoderVirtualParticipant extends VirtualParticipant {
  /**
   * @param {string} socketIoId
   * @returns {VirtualParticipant}
   */
  static getInstanceWithSocketIoId(socketIoId) {
    for (const p of Object.values(_instances)) {
      const testId = p.getSocketIoId();

      if (testId === socketIoId) {
        return p;
      }
    }
  }

  /**
   * @param {string} deviceAddress
   * @param {string} socketIoId
   * @param {Object} rest? [optional; default = {}] The this value is passed to
   * the super VirtualParticipant class.
   */
  constructor(deviceAddress, socketIoId, rest = {}) {
    if (!deviceAddress) {
      throw new Error("deviceAddress must be defined");
    }

    if (!socketIoId) {
      throw new Error("initialSocketIoId must be defined");
    }

    super({ ...rest });

    this._deviceAddress = deviceAddress;
    this._socketIoId = socketIoId;

    _instances[this._deviceAddress] = this;
  }

  /**
   * @return {string[]}
   */
  getSocketIoId() {
    return this._socketIoId;
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    delete _instances[this._deviceAddress];

    await super.destroy();
  }
}
