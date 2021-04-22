import BaseModule from "./ZenRTCPeer.BaseModule";
import { EVT_CONNECTED } from "../ZenRTCPeer";

// In milliseconds
const HEARTBEAT_INTERVAL_TIME = 5000;

export default class ZenRTCPeerHeartbeatModule extends BaseModule {
  constructor(zenRTCPeer) {
    super(zenRTCPeer);

    this.ping = this.ping.bind(this);

    this._heartbeatInterval = null;

    // Perform initial ping on connect
    zenRTCPeer.once(EVT_CONNECTED, () => {
      // Perform initial ping
      this.ping();

      // Handle heartbeat ping polling
      this._heartbeatInterval = setInterval(this.ping, HEARTBEAT_INTERVAL_TIME);
    });
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    // Stop the ping polling
    clearInterval(this._heartbeatInterval);

    await super.destroy();
  }

  /**
   * NOTE: Intentionally resolving void here, as no latency value is being
   * captured directly by the heartbeat class.
   *
   * The ZenRTCPeer class will capture its own latency as a result of this
   * call, which can be retrieved by calling ZenRTCPeer.getLatency().
   *
   * @return {Promise<void>}
   */
  async ping() {
    if (!this._zenRTCPeer.getIsConnected()) {
      console.warn("Skipping ping because peer is not connected");

      return;
    }

    return this._zenRTCPeer.ping().catch((err) => {
      console.error("Heartbeat failed", err);

      this._zenRTCPeer.destroy();
    });
  }
}
