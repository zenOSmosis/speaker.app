import { useEffect, useState } from "react";
import ChromePhantomSession, {
  EVT_PEER_CONNECTED,
  EVT_PEER_DISCONNECTED,
  EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  // EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  // EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
} from "../../../ChromePhantomSession";

export default function useChromeRTCPeerMonitor() {
  const [peerMonitor, _setChromePeerMonitor] = useState(null);
  const [zenRTCPeers, _setChromeZenRTCPeers] = useState([]);

  useEffect(() => {
    const peerMonitor = new ChromePhantomSession();

    _setChromePeerMonitor(peerMonitor);

    const _handlePeerUpdate = () => {
      const zenRTCPeers = peerMonitor.getPeers();

      // TODO: Remove
      console.log({
        zenRTCPeers,
      });

      _setChromeZenRTCPeers(zenRTCPeers);
    };

    peerMonitor.on(EVT_PEER_CONNECTED, _handlePeerUpdate);
    peerMonitor.on(EVT_PEER_DISCONNECTED, _handlePeerUpdate);

    peerMonitor.on(
      EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_ADDED,
      ([peer, { mediaStreamTrack, mediaStream }]) => {
        // TODO: Remove
        console.warn("TRACK ADDED", mediaStreamTrack);

        const otherPeers = peerMonitor.getOtherPeers(peer);

        // TODO: Remove
        console.log("peer media stream track added", {
          peer,
          peers: peerMonitor.getPeers(),
          otherPeers,
          mediaStreamTrack,
          mediaStream,
        });

        _handlePeerUpdate();
      }
    );

    peerMonitor.on(
      EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
      ([peer, { mediaStreamTrack, mediaStream }]) => {
        const otherPeers = peerMonitor.getOtherPeers(peer);

        // TODO: Remove
        console.log("peer media stream track removed", {
          peer,
          peers: peerMonitor.getPeers(),
          otherPeers,
          mediaStreamTrack,
          mediaStream,
        });

        _handlePeerUpdate();
      }
    );

    return function unmount() {
      peerMonitor.destroy();
    };
  }, []);

  return {
    peerMonitor,
    zenRTCPeers,
  };
}
