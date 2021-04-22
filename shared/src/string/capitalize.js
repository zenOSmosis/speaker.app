/**
 * Capitalizes the first letter of the given string.
 *
 * @see https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
 *
 * @param {string} s
 * @return {string}
 */
export default function capitalize(s) {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
