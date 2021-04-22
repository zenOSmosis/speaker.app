import getUnixTime from "./getUnixTime";

const startTime = getUnixTime();

/**
 * Returns the number of seconds since this module started.
 *
 * @return {number}
 */
export default function getUptime() {
  const now = getUnixTime();

  return now - startTime;
}
