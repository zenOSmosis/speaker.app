import { useEffect, useMemo, useRef } from "react";
import useForceUpdate from "@hooks/useForceUpdate";

import { PhantomCollection, EVT_UPDATED } from "phantom-core";

// TODO: Document
export default function usePhantomCollection(
  CollectionClass = PhantomCollection
) {
  const forceUpdate = useForceUpdate();

  // Memoize so we don't run the risk of the following useMemo re-running if
  // the passed in value was not memoized
  const refCollectionClass = useRef(CollectionClass);

  const collection = useMemo(() => {
    const collection = new refCollectionClass.current();

    if (!(collection instanceof PhantomCollection)) {
      throw new TypeError("collection is not a PhantomCollection");
    }

    collection.on(EVT_UPDATED, forceUpdate);

    return collection;
  }, [forceUpdate]);

  // Auto-destruct collection when unmount
  useEffect(() => {
    return function unmount() {
      if (collection) {
        collection.destroy();
      }
    };
  }, [collection]);

  return {
    collection,
    children: collection.getChildren(),
  };
}
