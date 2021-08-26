import { useCallback, useRef, useState } from "react";

// TODO: Use PhantomCore.mergeOptions for deep-merge, instead?

/**
 * Applies a shallow-merge strategy to object updates so that setState() calls
 * don't completely overwrite previous object state.
 *
 * Maintains backwards-compatibility for class-based components which have been
 * migrated to hook versions, without having to write a bunch of useState
 * references for every state property.
 *
 * @param {Object} defaultState
 * @return {[state: Object, setState: function, changeIdx: number]} Merged state
 */
export default function useObjectState(defaultState = {}) {
  const [state, _setMergedState] = useState(defaultState);

  const refState = useRef(state);
  refState.current = state;

  /**
   * @param {Object | string} updatedState If passed as a string, it will try
   * to JSON parse into an object.
   */
  const setState = useCallback(updatedState => {
    // Check type validity / apply type coercion, etc.
    switch (typeof updatedState) {
      case "string":
        updatedState = JSON.parse(updatedState);
        break;

      case "function":
        updatedState = updatedState(refState.current);
        break;

      case "object":
        // Objects are okay the way they are
        break;

      default:
        // TODO: Eventually throw this error once we know it doesn't raise a
        // bunch of warnings in the app as it is (August 6, 2021)
        console.warn(`Unhandled updatedState type: ${typeof updatedState}`);
        break;
    }

    return _setMergedState(prevState => ({ ...prevState, ...updatedState }));
  }, []);

  return [state, setState];
}
