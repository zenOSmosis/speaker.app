import React, { useCallback, useEffect, useMemo, useState } from "react";

import useForceUpdate from "@hooks/useForceUpdate";
import useSocketContext from "@hooks/useSocketContext";
import useClientDeviceContext from "@hooks/useClientDeviceContext";
import useDocumentTitle from "@hooks/useDocumentTitle";
import useObjectState from "@hooks/useObjectState";
import useLocalStorage from "@hooks/useLocalStorage";

import { KEY_TRANSCODER_DID_MANUALLY_LOGOUT } from "@local/localStorageKeys";

import { fetch } from "@shared/SocketAPIClient";
import {
  SOCKET_API_ROUTE_INIT_TRANSCODER_SESSION,
  SOCKET_API_ROUTE_CAPTURE_NETWORK_TOTAL_PARTICIPANTS,
  SOCKET_API_ROUTE_END_TRANSCODER_SESSION,
} from "@shared/socketAPIRoutes";

import TranscoderZenRTCManager, {
  EVT_DESTROYED,
  EVT_PEER_UPDATED,
  EVT_PEER_CONNECTED,
  EVT_PEER_DISCONNECTED,
  EVT_PEER_DESTROYED,
} from "../subClasses/TranscoderZenRTCManager";

import useSplitAppMessageBus, {
  TRANSCODER_EVT_CONNECTED,
  TRANSCODER_EVT_DISCONNECTED,
} from "@hooks/useSplitAppMessageBus";

export const TranscoderPhantomSessionContext = React.createContext({});

export default function TranscoderPhantomSessionProvider({ children }) {
  const mainAppMessageBus = useSplitAppMessageBus();

  const {
    socket,
    deviceAddress,
    isConnected: isSocketConnected,
    // connect: connectSocket,
    // disconnect: disconnectSocket,
  } = useSocketContext();

  const { setItem } = useLocalStorage();

  const forceUpdate = useForceUpdate();

  const [
    { networkName, realmId, channelId, networkDescription, transcoderManager },
    setState,
  ] = useObjectState({
    networkName: null,
    realmId: null,
    channelId: null,
    networkDescription: null,
    transcoderManager: null,
  });

  useTranscoderDocumentTitle({ realmId, channelId, isSocketConnected });

  const { peers } = useTranscoderManager(transcoderManager, {
    networkName,
    networkDescription,
  });

  const { userAgent, coreCount } = useClientDeviceContext();

  /**
   * Starts transcoding servicing for this network.
   *
   * @return {Promise<void>}
   */
  const login = useCallback(
    async ({
      realmId,
      channelId,
      networkName,
      networkDescription,
      isPublic,
    }) => {
      await fetch(SOCKET_API_ROUTE_INIT_TRANSCODER_SESSION, {
        deviceAddress,
        userAgent,
        coreCount,
        buildHash: process.env.REACT_APP_GIT_HASH,
        networkName,
        realmId,
        channelId,
        networkDescription,
        isPublic,
      });

      setState({
        networkName,
        realmId,
        channelId,
        networkDescription,
      });

      setItem(KEY_TRANSCODER_DID_MANUALLY_LOGOUT, false);
    },
    [coreCount, deviceAddress, userAgent, setState, setItem]
  );

  /**
   * Stops transcoding servicing for this network.
   *
   * @return {Promise<void>}
   */
  const logout = useCallback(async () => {
    await fetch(SOCKET_API_ROUTE_END_TRANSCODER_SESSION, {
      realmId,
      channelId,
    });

    transcoderManager && transcoderManager.destroy();

    setItem(KEY_TRANSCODER_DID_MANUALLY_LOGOUT, true);

    // Handle window close or redirect
    try {
      window.close();
    } catch (err) {
      console.debug("Caught", err);
    } finally {
      window.location.href = "/";
    }
  }, [realmId, channelId, transcoderManager, setItem]);

  useEffect(() => {
    if (socket && realmId && channelId && isSocketConnected) {
      const transcoderManager = new TranscoderZenRTCManager({
        socket,
        realmId,
        channelId,
        hostDeviceAddress: deviceAddress,
      });

      transcoderManager.on(EVT_PEER_UPDATED, forceUpdate);

      setState({ transcoderManager });

      // Emit to main app that we've connected
      mainAppMessageBus.sendEvent(TRANSCODER_EVT_CONNECTED);

      transcoderManager.once(EVT_DESTROYED, () => {
        // TODO: Implement reset state

        setState({
          transcoderManager: null,
          networkName: null,
          realmId: null,
          channelId: null,
          networkDescription: null,
        });

        // Emit to main app that we've disconnected
        mainAppMessageBus.sendEvent(TRANSCODER_EVT_DISCONNECTED);
      });

      return function unmount() {
        transcoderManager.destroy();
      };
    }
  }, [
    socket,
    realmId,
    channelId,
    forceUpdate,
    isSocketConnected,
    setState,
    deviceAddress,
    mainAppMessageBus,
  ]);

  // Handle manual window close
  useEffect(() => {
    if (mainAppMessageBus) {
      const handleBeforeUnload = () => {
        mainAppMessageBus.sendEvent(TRANSCODER_EVT_DISCONNECTED);
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return function unmount() {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [mainAppMessageBus]);

  // Whether or not the session is currently active
  const isConnected = useMemo(() => Boolean(transcoderManager), [
    transcoderManager,
  ]);

  /**
   * @return {number}
   */
  const getSessionUptime = useCallback(
    () => (transcoderManager ? transcoderManager.getInstanceUptime() : 0),
    [transcoderManager]
  );

  return (
    <TranscoderPhantomSessionContext.Provider
      value={{
        isConnected,
        networkName,
        realmId,
        channelId,
        networkDescription,
        login,
        logout,
        peers,
        getSessionUptime,
      }}
    >
      {children}
    </TranscoderPhantomSessionContext.Provider>
  );
}

// TODO: Split into separate file
function useTranscoderDocumentTitle({ realmId, channelId, isSocketConnected }) {
  const documentTitle = useMemo(() => {
    return (
      (isSocketConnected &&
        realmId &&
        channelId &&
        `${realmId} / ${channelId}`) ||
      null
    );
  }, [realmId, channelId, isSocketConnected]);

  useDocumentTitle(documentTitle, "speaker.app transcoder");
}

// TODO: Split into separate file
function useTranscoderManager(
  transcoderManager,
  { networkName, networkDescription }
) {
  const [peers, _setPeers] = useState([]);

  useEffect(() => {
    if (transcoderManager) {
      const _handlePeerUpdate = () => {
        const peers = transcoderManager.getPeers();

        _setPeers(peers);
      };

      transcoderManager.on(EVT_PEER_CONNECTED, _handlePeerUpdate);
      transcoderManager.on(EVT_PEER_DISCONNECTED, _handlePeerUpdate);
      transcoderManager.on(EVT_PEER_DESTROYED, _handlePeerUpdate);

      return function unmount() {
        transcoderManager.off(EVT_PEER_CONNECTED, _handlePeerUpdate);
        transcoderManager.off(EVT_PEER_DISCONNECTED, _handlePeerUpdate);
        transcoderManager.on(EVT_PEER_DESTROYED, _handlePeerUpdate);
      };
    } else {
      _setPeers([]);
    }
  }, [transcoderManager]);

  useEffect(() => {
    if (transcoderManager) {
      transcoderManager.setNetworkData({ networkName, networkDescription });
    }
  }, [transcoderManager, networkName, networkDescription]);

  const peerLength = peers.length;
  useEffect(() => {
    if (transcoderManager) {
      // TODO: Sync this to server
      fetch(SOCKET_API_ROUTE_CAPTURE_NETWORK_TOTAL_PARTICIPANTS, peerLength);
    }
  }, [transcoderManager, peerLength]);

  return {
    peers,
  };
}
