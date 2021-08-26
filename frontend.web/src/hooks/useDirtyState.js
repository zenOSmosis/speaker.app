import { useCallback, useMemo } from "react";
import useObjectState from "./useObjectState";

/**
 * A savable state wrapper around useObjectState, with the ability to cancel
 * back to previously saved state.
 *
 * @param {Object} defaultState?
 * @return {Object} TODO: Document return object
 */
export default function useDirtyState(defaultState = {}) {
  /**
   * Saved state.
   *
   * @type {Object}
   */
  const [cleanState, setCleanState] = useObjectState(defaultState);

  /**
   * Unsaved state.
   *
   * @type {Object}
   */
  const [dirtyState, setDirtyState] = useObjectState(defaultState);

  /**
   * @type {boolean}
   */
  const isDirty = useMemo(() => {
    const isDirty = JSON.stringify(cleanState) !== JSON.stringify(dirtyState);

    return isDirty;
  }, [cleanState, dirtyState]);

  /**
   * Set the clean state to the dirty state.
   */
  const save = useCallback(() => {
    if (isDirty) {
      setCleanState(dirtyState);
    }
  }, [setCleanState, dirtyState, isDirty]);

  /**
   * Revert the dirty state back to the clean state.
   */
  const cancel = useCallback(() => {
    if (isDirty) {
      setDirtyState(cleanState);
    }
  }, [setDirtyState, cleanState, isDirty]);

  /**
   * Sets new clean state (i.e. "saved")
   */
  const handleSetCleanState = useCallback(
    state => {
      setCleanState(state);
      setDirtyState(state);
    },
    [setCleanState, setDirtyState]
  );

  return {
    state: dirtyState,
    setState: setDirtyState,

    // TODO: Don't expose?
    setCleanState: handleSetCleanState,

    isDirty,
    save,
    cancel,
  };
}
