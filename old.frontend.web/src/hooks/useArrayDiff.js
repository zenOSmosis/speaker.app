import { PhantomCollection } from "phantom-core";
import { useEffect, useState } from "react";
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
  // IMPORTANT: Using empty array for previous default value
  const prev = usePrevious(next, []);

  const [addedRemoved, _setAddedRemoved] = useState({ added: [], removed: [] });

  useEffect(() => {
    // NOTE: This check is inside the useEffect so it is not re-run more often
    // than it should
    if (!Array.isArray(next)) {
      throw new Error("next should be an array");
    }

    const { added, removed } = PhantomCollection.getChildrenDiff(prev, next);

    if (added.length || removed.length) {
      _setAddedRemoved({
        added,
        removed,
      });
    }
  }, [prev, next]);

  return {
    added: addedRemoved.added,
    removed: addedRemoved.removed,
  };
}
