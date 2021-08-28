import { useEffect, useRef } from "react";

const DEFAULT_REF_VALUE = null;

/**
 * Adapted from:
 * @see https://usehooks.com/usePrevious
 *
 * getPreviousValue, a memoized callback with no dependencies, was added so
 * that the value could be obtained from within a hook without the value being
 * called as a dependency, which could cause an additional render.
 *
 * @param {any} value The current value
 * @param {boolean} defaultPreviousValue? [default = null]
 * @return {any} The previous value
 */
export default function usePrevious(
  value,
  defaultPreviousValue = DEFAULT_REF_VALUE
) {
  // The ref object is a generic container whose "current" property is mutable
  // and can hold any value, similar to an instance property on a class
  const refPrev = useRef(defaultPreviousValue);

  // Store current value in ref
  // Only re-run if value changes
  useEffect(() => {
    refPrev.current = value;
  }, [value]);

  // Return previous value (happens before update in useEffect above)
  return refPrev.current;
}
