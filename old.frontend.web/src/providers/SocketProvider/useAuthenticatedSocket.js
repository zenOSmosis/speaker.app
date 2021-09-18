import { useEffect, useState } from "react";
import io from "socket.io-client";
import SocketAPIClient from "@shared/SocketAPIClient";

import { SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED } from "@shared/socketEvents";
import {
  sendCachedAuthorization,
  getMergedAuthorization,
} from "@shared/adapters/serviceAuthorization/client";
import { KEY_SERVICE_AUTHORIZATION } from "@local/localStorageKeys";
import { EVT_CONNECT_ERROR } from "./socketConstants";

import useLocalStorage from "@hooks/useLocalStorage";

const CLIENT_BUILD_HASH = process.env.REACT_APP_GIT_HASH;

/**
 * Service authentication wrapper around Socket.io.
 */
export default function useAuthenticatedSocket() {
  const [socket, _setSocket] = useState(null);

  // NOTE: The deviceAddress represents the client id, and can be shared
  // between devices
  const [deviceAddress, _setDeviceAddress] = useState(null);

  const { getItem, setItem } = useLocalStorage();

  useEffect(() => {
    // Retrieve from local storage
    const cachedAuthorization = getItem(KEY_SERVICE_AUTHORIZATION) || {};

    const socket = io("/", {
      auth: {
        ...sendCachedAuthorization(cachedAuthorization),
      },
    });

    socket.on(EVT_CONNECT_ERROR, (err) => {
      console.warn("Caught", err);
    });

    const _handleAuthorizationGranted = (receivedAuthorization) => {
      if (receivedAuthorization.serverBuildHash !== CLIENT_BUILD_HASH) {
        // Force reload to try to update to latest hash
        //
        // TODO: Make work w/ service worker once PWA is available
        window.location.reload(true);
      } else {
        // Merge what's in our cache w/ what was received
        const mergedAuthorization = getMergedAuthorization(
          cachedAuthorization,
          receivedAuthorization
        );

        _setDeviceAddress(mergedAuthorization.clientIdentity.address);

        // Write to local storage
        setItem(KEY_SERVICE_AUTHORIZATION, mergedAuthorization);

        // Instantiate SocketAPIClient
        new SocketAPIClient(socket);

        _setSocket(socket);
      }
    };

    socket.once(
      SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED,
      _handleAuthorizationGranted
    );

    return function unmount() {
      socket.off(
        SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED,
        _handleAuthorizationGranted
      );

      socket.disconnect();

      _setSocket(null);
    };
  }, [setItem, getItem]);

  return { socket, deviceAddress };
}
