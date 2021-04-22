import React, { useEffect, useRef, useState } from "react";

import useLocalStorage from "@hooks/useLocalStorage";
import { KEY_HISTORICAL_SESSION_COUNT } from "@local/localStorageKeys";

import useSocketContext from "@hooks/useSocketContext";
import { SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION } from "@shared/socketAPIRoutes";
import { fetch } from "@shared/SocketAPIClient";

export const ClientDeviceContext = React.createContext({});

/**
 * Provides context for the given physical device / user-agent.
 *
 * For media support, @see InputMediaDevicesProvider.
 */
export default function ClientDeviceProvider({ children }) {
  const { getItem, setItem } = useLocalStorage();

  const refHistoricalSessionCount = useRef(null);

  // Count the number of times the UI has rendered from scratch
  useEffect(() => {
    const prevSessionCount =
      parseInt(getItem(KEY_HISTORICAL_SESSION_COUNT), 10) || 0;

    const historicalSessionCount = prevSessionCount + 1;

    refHistoricalSessionCount.current = historicalSessionCount;

    // Set cached state
    setItem(KEY_HISTORICAL_SESSION_COUNT, historicalSessionCount);
  }, [getItem, setItem]);

  const userAgent = navigator.userAgent;

  const { socket, deviceAddress } = useSocketContext();

  const [detectedDevice, _setDetectedDevice] = useState(null);

  useEffect(() => {
    if (socket) {
      fetch(SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION, {
        userAgent,
      }).then(_setDetectedDevice);
    }
  }, [socket, userAgent]);

  const coreCount = navigator.hardwareConcurrency;

  return (
    <ClientDeviceContext.Provider
      value={{
        userAgent,
        detectedDevice,
        deviceAddress,
        coreCount,
        historicalSessionCount: refHistoricalSessionCount.current,
      }}
    >
      {children}
    </ClientDeviceContext.Provider>
  );
}
