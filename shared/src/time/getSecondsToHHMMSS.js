/**
 * @see https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
 *
 * @param {number} seconds
 * @return {string} hh:mm:ss format
 */
export default function getSecondsToHHMMSS(secs) {
  // Note: This version should handle seconds if length is longer than one day
  return new Date((secs % (60 * 60 * 24)) * 1000).toISOString().substr(11, 8);
}
