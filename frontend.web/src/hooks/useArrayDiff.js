import { PhantomCollection } from "phantom-core";
import { useMemo } from "react";
import usePrevious from "./usePrevious";

/**
 * @typedef {Object} ArrayDiff
 * @property {any[]} added Elements added since last change
 * @property {any[]} removed Elements removed since last change
 *
 * @param {any[]} next
 * @return {ArrayDiff}
 */
export default function useArrayDiff(next) {
  // NOTE: Using empty array for previous default value type
  const prev = usePrevious(next, []);

  const { added, removed } = useMemo(() => {
    // NOTE: This check is inside the useMemo so it is not re-run more often
    // than it should
    if (!Array.isArray(next)) {
      throw new Error("next should be an array");
    }

    const { added, removed } = PhantomCollection.getChildrenDiff(prev, next);

    return { added, removed };
  }, [prev, next]);

  return {
    added,
    removed,
  };
}
