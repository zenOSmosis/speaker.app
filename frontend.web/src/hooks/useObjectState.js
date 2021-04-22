import { useCallback, useRef, useState } from "react";

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
  const setState = useCallback((updatedState) => {
    switch (typeof updatedState) {
      case "string":
        updatedState = JSON.parse(updatedState);
        break;

      case "function":
        updatedState = updatedState(refState.current);
        break;

      default:
        break;
    }

    return _setMergedState((prevState) => ({ ...prevState, ...updatedState }));
  }, []);

  return [state, setState];
}
