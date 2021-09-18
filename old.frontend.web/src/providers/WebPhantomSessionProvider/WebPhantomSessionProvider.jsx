import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ZenRTCContext } from "../WebZenRTCProvider";
import { SYNC_EVT_KICK } from "@shared/syncEvents";
import { EVT_SYNC_EVT_RECEIVED } from "@src/WebZenRTCPeer";

import { SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS } from "@shared/socketAPIRoutes";
import { SOCKET_EVT_NETWORKS_UPDATED } from "@shared/socketEvents";
import { fetch } from "@shared/SocketAPIClient";

import useNetworkState from "./useNetworkState";

import useSocketContext from "@hooks/useSocketContext";
import useClientDeviceContext from "@hooks/useClientDeviceContext";
import useLocalProfileContext from "@hooks/useLocalProfileContext";

import { getCallURL } from "@baseApps/MainApp/routes";

export const WebPhantomSessionContext = createContext({});

// IMPORTANT: Only available to mainApp context (not transcoderApp)
// TODO: Move to MainApp
export default function WebPhantomSessionProvider({ children }) {
  const {
    realmId,
    channelId,
    setRealmId,
    setChannelId,
    zenRTCPeer,
    connectZenRTC,
    disconnectZenRTC,
    isZenRTCConnecting: isConnecting,
    isZenRTCConnected: isConnected,
    incomingMediaStreamTracks,
    incomingAudioMediaStreamTracks,
    incomingVideoMediaStreamTracks,
    outgoingMediaStreamTracks,
    outgoingVideoMediaStreamTracks,
    outgoingAudioMediaStreamTracks,
    writableSyncObject,
    readOnlySyncObject,
    latency,
  } = useContext(ZenRTCContext);

  const { socket } = useSocketContext();
  const { detectedDevice, deviceAddress } = useClientDeviceContext();

  const localProfile = useLocalProfileContext();

  // TODO: Make another hook
  const [connectCount, setConnectCount] = useState(-1);
  useEffect(() => {
    if (isConnected) {
      setConnectCount(connectCount => connectCount + 1);
    }
  }, [isConnected]);

  // IMPORTANT: This session state directly only reflects the local muting
  // state and does not directly manipulate the outgoing audio controllers
  const [isMuted, setIsMuted] = useState(false);

  // TODO: Remove
  // NOTE: This useRef is to memoize the getIsMuted() function so a new
  // reference is not required for each pass
  //
  // This fixes an issue where this hook was excessively rendered
  // const refIsMuted = useRef(isMuted);
  // refIsMuted.current = isMuted;
  // const getIsMuted = useCallback(() => refIsMuted.current, []);

  useEffect(() => {
    if (writableSyncObject) {
      writableSyncObject.setState({
        isMuted,
      });
    }
  }, [writableSyncObject, isMuted]);

  // If connected and profile is updated, sync the profile w/ the host
  // transcoder
  useEffect(() => {
    if (
      localProfile &&
      !localProfile.isDirty &&
      writableSyncObject &&
      isConnected
    ) {
      const { avatarURL, name, description } = localProfile;

      writableSyncObject.setState({
        avatarURL,
        name,
        description,
        detectedDevice,
        deviceAddress,
      });
    }
  }, [
    localProfile,
    zenRTCPeer,
    writableSyncObject,
    isConnected,
    detectedDevice,
    deviceAddress,
  ]);

  /**
   * Local and remote participants
   */
  const { participants, networkData, getParticipantWithDeviceAddress } =
    useNetworkState(zenRTCPeer);

  const [isHostOnline, setIsHostOnline] = useState(false);

  // Destroy existing ZenRTCPeer if the host is offline
  useEffect(() => {
    if (!isHostOnline && zenRTCPeer) {
      zenRTCPeer.destroy();
    }
  }, [isHostOnline, zenRTCPeer]);

  // Auto-leave if current speaker.app network host goes offline
  //
  // NOTE (jh): This also works with the scenario that the host has
  // disconnected without gracefully shutting down
  useEffect(() => {
    if (socket) {
      const _handleNetworksUpdated = () => {
        if (realmId && channelId) {
          fetch(SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS, {
            realmId,
            channelId,
          }).then(setIsHostOnline);
        } else {
          setIsHostOnline(false);
        }
      };

      socket.on(SOCKET_EVT_NETWORKS_UPDATED, _handleNetworksUpdated);

      _handleNetworksUpdated();

      return function unmount() {
        socket.off(SOCKET_EVT_NETWORKS_UPDATED, _handleNetworksUpdated);
      };
    }
  }, [socket, realmId, channelId]);

  // TODO: Refactor
  useEffect(() => {
    if (zenRTCPeer) {
      const handleKickDetection = ({ eventName }) => {
        if (eventName === SYNC_EVT_KICK) {
          console.warn("You have been kicked!");

          // Don't wait for destroy to finish
          //
          // This seems to fix an error where "Transport not connected" is emit
          // from SocketProvider before the window is refreshed
          zenRTCPeer.destroy();

          // Soft-kick
          // NOTE: Intentionally using this instead of React-Router based
          // redirect
          window.location.href = "/";
        }
      };

      zenRTCPeer.on(EVT_SYNC_EVT_RECEIVED, handleKickDetection);

      return function unmount() {
        zenRTCPeer.off(EVT_SYNC_EVT_RECEIVED, handleKickDetection);
      };
    }
  }, [zenRTCPeer]);

  const connect = useCallback(
    async ({ realmId, channelId }) => {
      if (!isHostOnline) {
        console.warn("Cannot connect when host is not online");
      } else {
        await connectZenRTC({ realmId, channelId });
      }
    },
    [isHostOnline, connectZenRTC]
  );

  const disconnect = useCallback(() => {
    disconnectZenRTC();
  }, [disconnectZenRTC]);

  const getClientSessionUptime = useCallback(
    () => (zenRTCPeer && zenRTCPeer.getConnectionUptime()) || 0,
    [zenRTCPeer]
  );

  const publishMediaStream = useCallback(
    mediaStream => zenRTCPeer && zenRTCPeer.publishMediaStream(mediaStream),
    [zenRTCPeer]
  );

  const unpublishMediaStream = useCallback(
    mediaStream => zenRTCPeer && zenRTCPeer.unpublishMediaStream(mediaStream),
    [zenRTCPeer]
  );

  const getPublishedMediaStreams = useCallback(
    () => (zenRTCPeer && zenRTCPeer.getPublishedMediaStreams()) || [],
    [zenRTCPeer]
  );

  const getIsMediaStreamPublished = useCallback(
    mediaStream =>
      getPublishedMediaStreams()
        .map(({ id }) => id)
        .includes(mediaStream && mediaStream.id),
    [getPublishedMediaStreams]
  );

  const networkURL = useMemo(
    () => realmId && channelId && getCallURL({ realmId, channelId }),
    [realmId, channelId]
  );

  return (
    <WebPhantomSessionContext.Provider
      value={{
        realmId,
        channelId,
        setRealmId,
        setChannelId,
        isHostOnline,
        zenRTCPeer,
        connect,
        connectCount,
        isConnecting,
        isConnected,
        disconnect,
        getClientSessionUptime,
        participants, // Local and remote
        getParticipantWithDeviceAddress,
        networkData,
        publishMediaStream,
        unpublishMediaStream,
        getPublishedMediaStreams,
        getIsMediaStreamPublished,
        incomingMediaStreamTracks,
        incomingAudioMediaStreamTracks,
        incomingVideoMediaStreamTracks,
        outgoingMediaStreamTracks,
        outgoingVideoMediaStreamTracks,
        outgoingAudioMediaStreamTracks,
        writableSyncObject,
        readOnlySyncObject,

        setIsMuted,
        isMuted,

        // TODO: Remove
        // getIsMuted,

        latency,
        networkURL,
      }}
    >
      {children}
    </WebPhantomSessionContext.Provider>
  );
}
