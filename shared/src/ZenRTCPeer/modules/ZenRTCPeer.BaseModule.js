import PhantomBase, { EVT_DESTROYED } from "phantom-base";

export { EVT_DESTROYED };

export default class ZenRTCPeerBaseModule extends PhantomBase {
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
