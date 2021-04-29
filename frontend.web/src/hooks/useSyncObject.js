import { useCallback, useEffect, useState } from "react";
import { EVT_UPDATED } from "sync-object";

/**
 * A hook which wraps a SyncObject with useState-like handling.
 *
 * @param {SyncObject} syncObject
 * @return {Array<Object, function>}
 */
export default function useSyncObject(syncObject) {
  const [state, _setState] = useState(syncObject && syncObject.getState());

  /**
   * Binds the SyncObject to the hook state.
   */
  useEffect(() => {
    if (syncObject) {
      const _handleUpdate = () => _setState(syncObject.getState());

      syncObject.on(EVT_UPDATED, _handleUpdate);

      // Perform initial state sync, if not already set
      _handleUpdate();

      return function unmount() {
        syncObject.off(EVT_UPDATED, _handleUpdate);
      };
    }
  }, [syncObject]);

  /**
   * Note, this can be a partial state and in any format SyncObject accepts.
   *
   * The hook state is updated via the SyncObject's normal update handler.
   */
  const setState = useCallback(
    updatedState => {
      syncObject.setState(updatedState);
    },
    [syncObject]
  );

  return [state, setState];
}
