import { useCallback, useEffect, useMemo, useState } from "react";

import { SOCKET_API_ROUTE_FETCH_NETWORKS } from "@shared/socketAPIRoutes";
import { SOCKET_EVT_NETWORKS_UPDATED } from "@shared/socketEvents";
import { fetch } from "@shared/SocketAPIClient";

import useSocketContext from "./useSocketContext";

/**
 * TODO: Document
 *
 * TODO: Consider swapping out for react-query,
 *
 * Main issue is the query can be duplicated, and this may can de-dupe it.
 *
 * @see https://react-query.tanstack.com/overview
 */
export default function useNetworksQuery(options = {}) {
  const { skipAuto, realmId, channelId } = useMemo(() => {
    const DEFAULT_OPTIONS = { skipAuto: false };

    return {
      ...DEFAULT_OPTIONS,
      options,
    };
  }, [options]);

  const { socket, isConnected } = useSocketContext();

  const [networks, _setNetworks] = useState([]);

  // TODO: Handle pagination
  /** @return {Promise<Object[]>} */
  const handleFetchNetworks = useCallback(
    () =>
      fetch(SOCKET_API_ROUTE_FETCH_NETWORKS, { realmId, channelId }).then(
        _setNetworks
      ),
    [realmId, channelId]
  );

  useEffect(() => {
    if (!skipAuto && socket && isConnected) {
      // Perform initial network sync
      handleFetchNetworks();

      socket.on(SOCKET_EVT_NETWORKS_UPDATED, handleFetchNetworks);

      /**
       * Handle auto-refetch on page visibilitychange and focus.
       *
       * Borrowed the idea from:
       * @see https://react-query.tanstack.com/guides/window-focus-refetching
       */
      window.addEventListener("visibilitychange", handleFetchNetworks, false);
      window.addEventListener("focus", handleFetchNetworks, false);

      return function unmount() {
        socket.off(SOCKET_EVT_NETWORKS_UPDATED, handleFetchNetworks);

        window.removeEventListener("visibilitychange", handleFetchNetworks);
        window.removeEventListener("focus", handleFetchNetworks);
      };
    } else if (!isConnected) {
      // Unset the networks if there is no network connection

      _setNetworks([]);
    }
  }, [skipAuto, socket, isConnected, handleFetchNetworks]);

  return {
    networks,
  };
}
