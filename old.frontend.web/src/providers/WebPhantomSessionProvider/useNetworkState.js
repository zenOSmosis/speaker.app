import { useCallback, useEffect, useState } from "react";
import { EVT_UPDATED } from "sync-object";

// TODO: Document structure
// IMPORTANT: This hook should be treated as a singleton (provider based).
export default function useNetworkState(zenRTCPeer) {
  const [participants, _setParticipants] = useState([]);
  const [networkData, setNetworkData] = useState({});

  useEffect(() => {
    if (zenRTCPeer) {
      const readOnlySyncObject = zenRTCPeer.getReadOnlySyncObject();

      const peerSocketIoId = zenRTCPeer.getSocketIoId();

      const _handleUpdated = (updated = {}) => {
        if (updated.networkData) {
          setNetworkData(updated.networkData);
        }

        // IMPORTANT: If there are no object values passed, don't short-
        // circuit here.  This check for updated length fixes an issue where
        // virtual participants would not unregister after disconnect.
        if (Object.values(updated).length && !updated.peers) {
          return;
        }

        const { peers } = readOnlySyncObject.getState();

        if (peers) {
          /**
           * Media streams to / from all other participants.
           *
           * @type {MediaStream[]}
           */
          const allMediaStreams = [
            ...zenRTCPeer.getIncomingMediaStreams(),
            ...zenRTCPeer.getOutgoingMediaStreams(),
          ];

          // TODO: Utilize w/ VirtualParticipants
          const participants = Object.keys(peers)
            .filter(socketIoId => Boolean(peers[socketIoId]))
            .map(socketIoId => {
              const peer = peers[socketIoId];

              const isLocal = socketIoId === peerSocketIoId;

              /**
               * @type {string[]} Array of MediaStream ids for the current
               * participant.
               */
              const participantMediaStreamIds =
                (peer && peer.media && peer.media.split(",")) || [];

              /**
               * @type {MediaStream[]} Array of MediaStreams for the current
               * participant.
               */
              const participantMediaStreams = allMediaStreams.filter(({ id }) =>
                participantMediaStreamIds.includes(id)
              );

              return {
                ...{
                  /** @type {string} */
                  socketIoId,

                  /** @type {boolean} */
                  isLocal,

                  ...peer,

                  /** @type {MediaStream[]} */
                  mediaStreams: participantMediaStreams,

                  /** @type {MediaStreamTrack[]} */
                  mediaStreamTracks: participantMediaStreams
                    .map(mediaStream => mediaStream.getTracks())
                    .flat(),
                },
              };
            });

          _setParticipants(participants);
        }
      };

      // IMPORTANT: zenRTCPeer EVT_UPDATED is also listened to here because
      // stream mappings may come in slower over the peer due to WebRTC
      // negotiations
      zenRTCPeer.on(EVT_UPDATED, _handleUpdated);
      readOnlySyncObject.on(EVT_UPDATED, _handleUpdated);

      return function unmount() {
        zenRTCPeer.off(EVT_UPDATED, _handleUpdated);
        readOnlySyncObject.off(EVT_UPDATED, _handleUpdated);
      };
    } else {
      // Not connected; no participants on the line
      _setParticipants([]);
    }
  }, [zenRTCPeer]);

  const getParticipantWithDeviceAddress = useCallback(
    deviceAddress => {
      for (const p of participants) {
        if (p.deviceAddress === deviceAddress) {
          return p;
        }
      }
    },
    [participants]
  );

  return {
    participants,
    networkData,
    getParticipantWithDeviceAddress,
  };
}
