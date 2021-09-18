import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import WebZenRTCPeer, {
  EVT_CONNECTING,
  EVT_CONNECTED,
  EVT_DISCONNECTED,
  EVT_DESTROYED,
  EVT_UPDATED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
} from "../../WebZenRTCPeer";

// TODO: Implement Screen Wake Lock API
// @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

import useSocketContext from "@hooks/useSocketContext";

export const ZenRTCContext = React.createContext({});

export default function WebZenRTCProvider({
  children,
  ZenRTCClass = WebZenRTCPeer,
}) {
  const { socket } = useSocketContext();

  // TODO: Swap out these states w/ useObjectState?
  // TODO: Reset all track states when ZenRTCPeer is destroyed

  const [zenRTCPeer, _setZenRTCPeer] = useState(null);

  const [realmId, setRealmId] = useState(null);
  const [channelId, setChannelId] = useState(null);

  const [isZenRTCConnecting, _setIsZenRTCConnecting] = useState(false);
  const [isZenRTCConnected, _setIsZenRTCConnected] = useState(false);

  const [incomingMediaStreamTracks, _setIncomingMediaStreamTracks] = useState(
    []
  );

  const [incomingAudioMediaStreamTracks, _setIncomingAudioMediaStreamTracks] =
    useState([]);

  const [incomingVideoMediaStreamTracks, _setIncomingVideoMediaStreamTracks] =
    useState([]);

  const [latency, setLatency] = useState(0);

  // Reset incoming tracks on peer disconnect
  useEffect(() => {
    if (!zenRTCPeer) {
      // TODO: Combine the handling of these
      _setIncomingMediaStreamTracks([]);
      _setIncomingAudioMediaStreamTracks([]);
      _setIncomingVideoMediaStreamTracks([]);
    }
  }, [zenRTCPeer]);

  const [outgoingMediaStreamTracks, _setOutgoingMediaStreamTracks] = useState(
    []
  );
  const [outgoingAudioMediaStreamTracks, _setOutgoingAudioMediaStreamTracks] =
    useState([]);
  const [outgoingVideoMediaStreamTracks, _setOutgoingVideoMediaStreamTracks] =
    useState([]);

  const isSocketIoConnected = socket && socket.connected;

  /**
   * Disconnects current ZenRTCPeer instance, if connected.
   *
   * If no zenRTCPeer instance is set, the call is ignored.
   *
   * @return {Promise<void>}
   */
  const disconnectZenRTC = useCallback(async () => {
    if (zenRTCPeer) {
      await zenRTCPeer.destroy();
    }

    setRealmId(null);
    setChannelId(null);
  }, [zenRTCPeer]);

  /**
   * Creates a new WebZenRTCPeer instance and tries to connect to it.
   *
   * NOTE: Despite the value of the hook's realmId / channelId states, the
   * realmId and channelId must currently be passed to the connect function,
   * and it will override the current realm / channel values once connected.
   *
   * @return {Promise<void>}
   */
  const connectZenRTC = useCallback(
    async ({ realmId, channelId }) => {
      // Destroy existing connection, if already established
      if (zenRTCPeer) {
        await zenRTCPeer.destroy();
      }

      await (async () => {
        if (!realmId || !channelId || !socket || !isSocketIoConnected) {
          console.warn("WebZenRTCPeer is not currently connectable");

          return;
        }

        const zenRTCPeer = new ZenRTCClass({
          realmId,
          channelId,
          socket,

          // Web side calls into server, so we're the initiator
          isInitiator: true,
        });

        _setZenRTCPeer(zenRTCPeer);

        // Set up event binding
        (() => {
          zenRTCPeer.on(EVT_UPDATED, () => setLatency(zenRTCPeer.getLatency()));

          zenRTCPeer.on(EVT_CONNECTING, () => _setIsZenRTCConnecting(true));
          zenRTCPeer.on(EVT_CONNECTED, () => {
            _setIsZenRTCConnecting(false);
            _setIsZenRTCConnected(true);
          });

          const _handleDisconnected = () => {
            _setIsZenRTCConnecting(false);
            _setIsZenRTCConnected(false);

            // Remove incoming tracks
            _setIncomingMediaStreamTracks([]);
          };

          zenRTCPeer.on(EVT_DISCONNECTED, _handleDisconnected);

          // Handle cleanup
          zenRTCPeer.on(EVT_DESTROYED, () => {
            _handleDisconnected();

            // Clear hook zenRTC instance
            _setZenRTCPeer(null);
          });

          const _handleOutgoingMediaStreamTrackAddRemove = () => {
            const outgoingMediaStreamTracks =
              zenRTCPeer.getOutgoingMediaStreamTracks();

            _setOutgoingMediaStreamTracks(outgoingMediaStreamTracks);

            _setOutgoingAudioMediaStreamTracks(
              outgoingMediaStreamTracks.filter(({ kind }) => kind === "audio")
            );

            _setOutgoingVideoMediaStreamTracks(
              outgoingMediaStreamTracks.filter(({ kind }) => kind === "video")
            );
          };

          zenRTCPeer.on(
            EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
            _handleOutgoingMediaStreamTrackAddRemove
          );

          zenRTCPeer.on(
            EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
            _handleOutgoingMediaStreamTrackAddRemove
          );

          // Perform initial sync
          _handleOutgoingMediaStreamTrackAddRemove();

          const _handleIncomingMediaStreamTrackAddRemove = () => {
            const incomingMediaStreamTracks =
              zenRTCPeer.getIncomingMediaStreamTracks();
            _setIncomingMediaStreamTracks(incomingMediaStreamTracks);

            _setIncomingAudioMediaStreamTracks(
              incomingMediaStreamTracks.filter(({ kind }) => kind === "audio")
            );

            _setIncomingVideoMediaStreamTracks(
              incomingMediaStreamTracks.filter(({ kind }) => kind === "video")
            );
          };

          zenRTCPeer.on(
            EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
            _handleIncomingMediaStreamTrackAddRemove
          );

          zenRTCPeer.on(
            EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
            _handleIncomingMediaStreamTrackAddRemove
          );
        })();

        // Firefox is slow to kick off the EVT_CONNECTING event, so we set it
        // here
        _setIsZenRTCConnecting(true);

        // Start the connection
        await zenRTCPeer.connect();

        // Register the realm and channel with the hook
        setRealmId(realmId);
        setChannelId(channelId);
      })();
    },
    [zenRTCPeer, socket, isSocketIoConnected, ZenRTCClass]
  );

  // TODO: Do we really need this useRef?
  //
  // Auto-destroy zenRTCPeer on unmount
  const refZenRTCPeer = useRef(zenRTCPeer);
  refZenRTCPeer.current = zenRTCPeer;
  useEffect(() => {
    return function unmount() {
      if (refZenRTCPeer.current) {
        refZenRTCPeer.current.destroy();
      }
    };
  }, []);

  // Reset state on disconnect
  useEffect(() => {
    if (!isZenRTCConnected) {
      setRealmId(null);
      setChannelId(null);
      setLatency(0);
    }
  }, [isZenRTCConnected]);

  /**
   * SyncObject meant to be writable from this peer only, and readOnly on other
   * peer.
   *
   * @type {SyncObject | void}
   */
  const writableSyncObject = useMemo(
    () => zenRTCPeer && zenRTCPeer.getWritableSyncObject(),
    [zenRTCPeer]
  );

  /**
   * SyncObject meant to be read-only on this peer, and writable on the other
   * peer.
   *
   * @type {SyncObject | void}
   */
  const readOnlySyncObject = useMemo(
    () => zenRTCPeer && zenRTCPeer.getReadOnlySyncObject(),
    [zenRTCPeer]
  );

  return (
    <ZenRTCContext.Provider
      value={{
        realmId,
        channelId,
        setRealmId,
        setChannelId,
        zenRTCPeer,
        isSocketIoConnected,
        connectZenRTC,
        disconnectZenRTC,
        isZenRTCConnecting,
        isZenRTCConnected,
        incomingMediaStreamTracks,
        incomingAudioMediaStreamTracks,
        incomingVideoMediaStreamTracks,
        outgoingMediaStreamTracks,
        outgoingVideoMediaStreamTracks,
        outgoingAudioMediaStreamTracks,
        writableSyncObject,
        readOnlySyncObject,

        // TODO: Don't pass latency this way (it changes often, and entire app shouldn't re-render because of it)
        latency,
      }}
    >
      {children}
    </ZenRTCContext.Provider>
  );
}
