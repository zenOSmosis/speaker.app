import { useEffect, useMemo, useRef } from "react";
import useObjectState from "./useObjectState";

import { PhantomCollection, EVT_UPDATED } from "phantom-core";

// TODO: Document
export default function usePhantomCollection(
  collectionClass = PhantomCollection
) {
  const [{ children /* addedChildren, removedChildren */ }, setObjectState] =
    useObjectState({
      children: [],
      // addedChildren: [],
      // removedChildren: [],
    });

  // Memoize so we don't run the risk of the following useMemo re-running if
  // the passed in value was not memoized
  const refCollectionClass = useRef(collectionClass);

  const collection = useMemo(() => {
    const collection = new refCollectionClass.current();

    if (!(collection instanceof PhantomCollection)) {
      throw new TypeError("collection is not a PhantomCollection");
    }

    // let prevChildren = collection.getChildren();

    const _handleUpdate = () => {
      const nextChildren = collection.getChildren();

      /*
      const { added: addedChildren, removed: removedChildren } =
        PhantomCollection.getUpdateDiff(prevChildren, nextChildren);

      prevChildren = nextChildren;
      */

      setObjectState({
        children: nextChildren,
        // addedChildren,
        // removedChildren,
      });
    };

    collection.on(EVT_UPDATED, _handleUpdate);

    return collection;
  }, [setObjectState]);

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
    children,

    /*
    addedChildren,
    removedChildren,
    */
  };
}
