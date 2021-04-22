import React, { createContext, useCallback, useEffect, useState } from "react";
import getUnixTime from "@shared/time/getUnixTime";
import useAuthenticatedSocket from "./useAuthenticatedSocket";

import { EVT_CONNECT, EVT_DISCONNECT } from "./socketConstants";

export const SocketContext = createContext({});

// TODO: Document
export default function SocketProvider({ children }) {
  const { socket, deviceAddress } = useAuthenticatedSocket();

  // Automatically disconnect when component unmounts
  useEffect(() => {
    if (socket) {
      return function unmount() {
        socket.disconnect();
      };
    }
  }, [socket]);

  const [isConnected, _setIsConnected] = useState(false);

  /**
   * Unix time of when the connection started.
   *
   * @type {number}
   **/
  const [connectionStartTime, _setConnectionStartTime] = useState(null);

  /**
   * Retrieves the number of seconds since the connection has been established.
   *
   * Upon reconnect, it resets to 0.
   *
   * @return {number}
   */
  const getConnectionUptime = useCallback(
    () => connectionStartTime && getUnixTime() - connectionStartTime,
    [connectionStartTime]
  );

  useEffect(() => {
    if (!socket) {
      return;
    }

    const _handleConnect = () => {
      // TODO: Perform negotiations here (i.e. check if we're running latest software locally)
      // @see https://socket.io/docs/v3/middlewares/

      _setIsConnected(true);
      _setConnectionStartTime(getUnixTime());
    };

    const _handleDisconnect = () => {
      _setIsConnected(false);
      _setConnectionStartTime(null);
    };

    // Perform initial sync
    if (socket.connected) {
      _handleConnect();
    } else {
      _handleDisconnect();
    }

    socket.on(EVT_CONNECT, _handleConnect);
    socket.on(EVT_DISCONNECT, _handleDisconnect);

    return function unmount() {
      socket.off(EVT_CONNECT, _handleConnect);
      socket.off(EVT_DISCONNECT, _handleDisconnect);
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        deviceAddress,
        isConnected,
        connectionStartTime,
        getConnectionUptime,
        // backendBuildHash,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
