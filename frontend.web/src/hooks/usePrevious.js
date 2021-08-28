import { useCallback, useEffect, useRef } from "react";

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
 * @return {Object<getPreviousValue: function>}
 */
export default function usePrevious(value) {
  // The ref object is a generic container whose "current" property is mutable
  // and can hold any value, similar to an instance property on a class
  const refPrev = useRef(DEFAULT_REF_VALUE);
  const ref = useRef(DEFAULT_REF_VALUE);
  // Store current value in ref
  useEffect(() => {
    // The old value, before the update
    const prev = ref.current;

    refPrev.current = prev;

    // Update current
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)

  /**
   * @return {any} The previous value
   */
  const getPreviousValue = useCallback(() => {
    const prev = refPrev.current;

    return prev;
  }, []);

  return { getPreviousValue };
}
