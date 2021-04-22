import { useCallback, useEffect, useMemo, useState, useRef } from "react";

/**
 * Given the callback and condition, runs the callback once, once the condition
 * is met.
 *
 * The reset function enables the hook to be re-run.
 *
 * @param {function} callback
 * @param {boolean} condition
 * @return {Object} // TODO: Document
 */
export default function useOnce(callback, condition = true) {
  const [isConditionFulfilled, setIsConditionFulfilled] = useState(false);

  const refCallback = useRef(callback);
  refCallback.current = callback;

  const truthy = useMemo(() => Boolean(condition), [condition]);

  useEffect(() => {
    const callback = refCallback.current;

    if (!isConditionFulfilled && truthy) {
      (async () => {
        await callback();

        setIsConditionFulfilled(true);
      })();
    }
  }, [isConditionFulfilled, truthy]);

  // Once invoked, allows the callback to be re-run once the condition is true
  // again
  const reset = useCallback(() => setIsConditionFulfilled(false), []);

  return {
    reset,
  };
}
