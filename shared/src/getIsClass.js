import { prototype } from "events";

/**
 * Determines if the supplied object is a JavaScript class.
 *
 * @param {Object} obj
 * @return {boolean}
 */
export default function getIsClass(obj) {
  return Boolean(
    obj &&
      obj.__proto__ &&
      obj.__proto__.constructor &&
      obj.__proto__.constructor.name !== "Object"
  );
}
