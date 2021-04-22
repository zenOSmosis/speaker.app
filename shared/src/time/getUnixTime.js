/**
 * Retrieves seconds since midnight January 1, 1970.
 *
 * @return {number}
 */
const getUnixTime = () => {
  const date = new Date();
  const unixTime = Math.round(date.getTime() / 1000);

  return unixTime;
};

export default getUnixTime;
