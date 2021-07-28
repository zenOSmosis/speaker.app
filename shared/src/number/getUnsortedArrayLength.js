/**
 * Why: In arrays with custom keys set, array.length returns the wrong value,
 * as it references the next index position.
 *
 * @see https://stackoverflow.com/a/31065083
 *
 * @return {number}
 */
export default function getUnsortedArrayLength(a) {
  let len = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== undefined) {
      len++;
    }
  }

  return len;
}
