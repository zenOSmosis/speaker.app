/**
 * @param {String} name
 * @return {String}
 */
export default function getInitials(name) {
  return (
    name &&
    name
      .split(" ")
      .map(name => name.substring(0, 1).toUpperCase())
      .join("")
  );
}
