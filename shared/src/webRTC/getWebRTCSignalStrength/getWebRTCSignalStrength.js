// TODO: Move to ZenRTCPeer

const MAX_THRESHOLD = 500;
const TARGET_THRESHOLD = 100;

// NOTE: Minimal strength is set to a non-zero value because any latency
// calculation means that some data was transmitted.
export const MINIMAL_SIGNAL_STRENGTH = 0.01;

/**
 * @param {number} latency Milliseconds of latency, where lower values
 * represent better signal strength.
 * @return {number} A float value, in the range of 0.0 - 1.0, where higher
 * values represent better signal strength.
 */
export default function getWebRTCSignalStrength(latency) {
  const calculatedStrength =
    1 - (latency - TARGET_THRESHOLD) / (MAX_THRESHOLD - TARGET_THRESHOLD);

  return calculatedStrength > 1
    ? 1
    : calculatedStrength <= MINIMAL_SIGNAL_STRENGTH
    ? MINIMAL_SIGNAL_STRENGTH
    : calculatedStrength;
}
