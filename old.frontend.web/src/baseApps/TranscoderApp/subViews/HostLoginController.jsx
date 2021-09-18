import React, { useCallback, useEffect, useState } from "react";
import Center from "@components/Center";

import useLocalStorage from "@hooks/useLocalStorage";
import { KEY_TRANSCODER_LOCAL_STORAGE_CREDS } from "@local/localStorageKeys";

import useSocketContext from "@hooks/useSocketContext";
import useSplitAppMessageBus, {
  MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
  TRANSCODER_EVT_READY,
} from "@hooks/useSplitAppMessageBus";

import useTranscoderPhantomSessionContext from "@baseApps/TranscoderApp/subHooks/useTranscoderPhantomSessionContext";

import { useLocation } from "react-router-dom";

export default function HostLoginController() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { isConnected: isSocketConnected } = useSocketContext();

  const { getItem } = useLocalStorage();

  const {
    login,
    isConnected: isSessionConnected,
  } = useTranscoderPhantomSessionContext();

  const handleLogin = useCallback(
    async (...args) => {
      setIsLoggingIn(true);

      await login(...args);

      setIsLoggingIn(false);
    },
    [login]
  );

  const mainAppMessageBus = useSplitAppMessageBus();

  const location = useLocation();
  useEffect(() => {
    if (isSocketConnected && !isSessionConnected) {
      const _handleConnectRequest = (loginCreds) => {
        handleLogin(loginCreds);
      };

      // Try with cached credentials (for auto-reconnect / uncontrolled sessions)
      const loginCreds = getItem(KEY_TRANSCODER_LOCAL_STORAGE_CREDS);
      if (loginCreds) {
        _handleConnectRequest(loginCreds);
      } else {
        // This is likely never to be utilized if local storage is available
        mainAppMessageBus.once(
          MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
          _handleConnectRequest
        );
      }

      // Emit to the main app that we're ready to accept connection requests
      mainAppMessageBus.sendEvent(TRANSCODER_EVT_READY);

      return function unmount() {
        mainAppMessageBus.off(
          MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
          _handleConnectRequest
        );
      };
    }
  }, [
    location,
    isSocketConnected,
    isSessionConnected,
    handleLogin,
    mainAppMessageBus,
    getItem,
  ]);

  return (
    <Center style={{ fontWeight: "bold" }}>
      {isLoggingIn ? (
        <div>Initiating Session</div>
      ) : isSessionConnected ? (
        <div>Session Connected</div>
      ) : (
        <div>Awaiting Control Message</div>
      )}
    </Center>
  );
}
