import DeviceDetector from "device-detector-js";

const deviceDetector = new DeviceDetector();

// TODO: Look into alternative UAParser.js: https://www.npmjs.com/package/ua-parser-js instead

/**
 * @see https://www.npmjs.com/package/device-detector-js
 */
export default function parseUserAgent({ userAgent }) {
  return deviceDetector.parse(userAgent);
}
