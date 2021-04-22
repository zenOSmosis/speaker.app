import DeviceDetector from "device-detector-js";

const deviceDetector = new DeviceDetector();

/**
 * @see https://www.npmjs.com/package/device-detector-js
 */
export function parseUserAgent({ userAgent }) {
  return deviceDetector.parse(userAgent);
}
