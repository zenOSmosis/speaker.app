import PhantomCore, { EVT_DESTROYED } from "phantom-core";

export { EVT_DESTROYED };

export default class ZenRTCPeerBaseModule extends PhantomCore {
  constructor(zenRTCPeer) {
    super();

    this._zenRTCPeer = zenRTCPeer;

    // Destroy this module once peer is destroyed
    this._zenRTCPeer.once(EVT_DESTROYED, () => this.destroy());
  }

  /**
   * @return {ZenRTCPeer}
   */
  getZenRTCPeer() {
    return this._zenRTCPeer;
  }
}
