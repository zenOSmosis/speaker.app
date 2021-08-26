import ZenRTCPeer, {
  EVT_UPDATED,
  EVT_CONNECTING,
  EVT_CONNECTED,
  EVT_DISCONNECTED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_SYNC_EVT_RECEIVED,
  EVT_DATA_RECEIVED,
  EVT_SDP_OFFERED,
  EVT_SDP_ANSWERED,
  EVT_ZENRTC_SIGNAL,
  EVT_DESTROYED,
} from "@shared/ZenRTCPeer";
import WebIPCMessageBroker, {
  EVT_MESSAGE_RECEIVED,
} from "@src/WebIPCMessageBroker";

export {
  EVT_UPDATED,
  EVT_CONNECTING,
  EVT_CONNECTED,
  EVT_DISCONNECTED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_SYNC_EVT_RECEIVED,
  EVT_DATA_RECEIVED,
  EVT_SDP_OFFERED,
  EVT_SDP_ANSWERED,
  EVT_ZENRTC_SIGNAL,
  EVT_DESTROYED,
};

// IMPORTANT: Not to be used w/ transcoder peer
export default class WebZenRTCPeer extends ZenRTCPeer {
  constructor({ realmId, channelId, socket, ...rest }) {
    // Attach WebIPCMessageBroker instance to super
    super({
      realmId,
      channelId,
      socketIoId: socket.id,
      ...rest,
    });

    // Set up WebIPCMessageBroker instance
    (() => {
      const ipcMessageBroker = new WebIPCMessageBroker({
        realmId,
        channelId,
        socket,
      });

      this.on(EVT_ZENRTC_SIGNAL, data => ipcMessageBroker.sendMessage(data));

      ipcMessageBroker.on(EVT_MESSAGE_RECEIVED, data => {
        this.receiveZenRTCSignal(data);
      });

      this.once(EVT_DESTROYED, () => {
        ipcMessageBroker.destroy();
      });
    })();

    // Stop all outgoing media stream tracks on disconnect
    this.on(EVT_DISCONNECTED, () => {
      for (const mediaStreamTrack of this.getOutgoingMediaStreamTracks()) {
        mediaStreamTrack.stop();
      }
    });
  }

  async disconnect() {
    // TODO: Move handling into beforeDisconnect handler?
    const shouldDisconnect = await new Promise(resolve =>
      window.confirm("Are you sure you wish to disconnect?")
        ? resolve(true)
        : resolve(false)
    );

    if (shouldDisconnect) {
      super.disconnect();
    }
  }
}
