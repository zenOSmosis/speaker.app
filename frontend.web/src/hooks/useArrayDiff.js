import { PhantomCollection } from "phantom-core";
import { useMemo } from "react";
import usePrevious from "./usePrevious";

// TODO: Document
export default function useArrayDiff(next) {
  // NOTE: Using empty array for previous default value type
  const prev = usePrevious(next, []);

  const { added, removed } = useMemo(() => {
    const { added, removed } = PhantomCollection.getChildrenDiff(prev, next);

    return { added, removed };
  }, [prev, next]);

  return {
    added,
    removed,
  };
}
