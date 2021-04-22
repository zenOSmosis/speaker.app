import { useCallback, useEffect, useState } from "react";
import SyncObject, { EVT_UPDATED } from "@shared/SyncObject";

import { debounce } from "lodash";

// Amount of time (in milliseconds) from when network update has been received
// to when we should render it
const UPDATE_DEBOUNCE_TIME = 500;

// TODO: Document structure
export default function useNetworkState(zenRTCPeer) {
  const [participants, _setParticipants] = useState([]);
  const [networkData, setNetworkData] = useState({});

  useEffect(() => {
    if (zenRTCPeer) {
      const readOnlySyncObject = zenRTCPeer.getReadOnlySyncObject();

      const peerSocketIoId = zenRTCPeer.getSocketIoId();

      const _handleUpdated = debounce(
        (updated) => {
          // TODO: Remove
          console.debug({
            state: readOnlySyncObject.getState(),
          });

          updated = SyncObject.readDecorator(updated) || {};

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
            const mediaStreams = [
              ...zenRTCPeer.getIncomingMediaStreams(),
              ...zenRTCPeer.getOutgoingMediaStreams(),
            ];

            // TODO: Utilize w/ VirtualParticipants
            const participants = Object.keys(peers)
              .filter((peer) => Boolean(peer))
              .map((socketIoId) => {
                const peer = peers[socketIoId];

                if (!peer) {
                  return null;
                }

                const isLocal = socketIoId === peerSocketIoId;

                // Parse media stream ids into media streams
                const peerMediaStreamIds = Object.keys(
                  (peer && peer.media) || {}
                );

                const peerMediaStreams = mediaStreams.filter(({ id }) =>
                  peerMediaStreamIds.includes(id)
                );

                return {
                  ...{
                    /** @type {string} */
                    socketIoId,

                    /** @type {boolean} */
                    isLocal,

                    ...peer,

                    /** @type {MediaStream[]} */
                    mediaStreams: peerMediaStreams,

                    /** @type {MediaStreamTrack[]} */
                    mediaStreamTracks: peerMediaStreams
                      .map((mediaStream) => mediaStream.getTracks())
                      .flat(),
                  },
                };
              });

            _setParticipants(participants);
          }
        },
        UPDATE_DEBOUNCE_TIME,
        {
          trailing: true,
        }
      );

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
    (deviceAddress) => {
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
