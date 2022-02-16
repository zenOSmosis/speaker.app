/**
 * String renderings for orders of magnitude of data.
 *
 * Using decimal bbreviations as specified in:
 * @see https://en.wikipedia.org/wiki/Megabyte
 *
 * Adapted from:
 * @see https://gist.github.com/lanqy/5193417
 *
 * @param {number} bytes
 * @return {string}
 */
const bytesToSize = bytes => {
  const sizes = ["bytes", "kB", "MB", "GB", "TB"];
  if (bytes === 0) return `0 ${sizes[0]}`;
  const i = parseInt(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    10
  );
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

export default bytesToSize;
