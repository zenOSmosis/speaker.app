/**
 * @see https://stackoverflow.com/a/11900218
 *
 * @param {any} data
 * @return {number}
 */
export default function getRoughSizeOfObject(data) {
  const objectList = [];
  const stack = [data];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (typeof value === "boolean") {
      bytes += 4;
    } else if (typeof value === "string") {
      bytes += value.length * 2;
    } else if (typeof value === "number") {
      bytes += 8;
    } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
      objectList.push(value);

      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}
