import ChromeZenRTCPeerMonitor, {
  EVT_PEER_CONNECTED,
  EVT_PEER_DISCONNECTED,
  EVT_PEER_DATA_RECEIVED,
  EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_PEER_MONITOR_SYNC_EVT_RECEIVED,
} from "./ChromeZenRTCPeerMonitor";

import {
  CAPABILITY_REMOTE_KEYBOARD_GAME_INPUT,
  // CAPABILITY_REMOTE_KEYBOARD_MUSICAL_INPUT,
  CAPABILITY_CAN_RECEIVE_AUDIO,
  CAPABILITY_CAN_RECEIVE_VIDEO,
} from "../shared/capabilities";

import CachedHowl, { howlerMediaStream } from "./CachedHowl";

import {
  SYNC_EVT_PHANTOM_EVENT_CHANNEL_QUERY,
  SYNC_EVT_PHANTOM_SESSION_MAP,
  SYNC_EVT_PHANTOM_PEER_PUBLIC_STATE_UPDATE,
  SYNC_EVT_TTS,
  SYNC_EVT_MIDI_NOTE,
  SYNC_EVT_CHAT_MESSAGE,
  SYNC_EVT_PHANTOM_SERVER_SESSION_UPTIME,
  SYNC_EVT_DEBUG,
} from "../shared/syncEvents";

import { getInstrumentWithId } from "../shared/midi/midiInstruments";

export {
  EVT_PEER_CONNECTED,
  EVT_PEER_DISCONNECTED,
  EVT_PEER_DATA_RECEIVED,
  EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_PEER_MONITOR_SYNC_EVT_RECEIVED,
};

// TODO: Rename to PhantomSessionController?

/**
 * Extends ChromeZenRTCPeerMonitor with multi-peer MediaStreamTrack management.
 *
 * Note: This class acts as both a proxy and a controller between multiple
 * ChromeZenRTCPeer instances.
 */
export default class ChromePhantomSession extends ChromeZenRTCPeerMonitor {
  constructor() {
    super();

    /**
     * The session start time.
     *
     * @type {number}
     **/
    this._startTime = new Date().getTime();

    // TODO: Prevent multiple instances of this class from re-publishing tracks (should it be a singleton?)

    // Route all streams to other streams
    (() => {
      // Peer connect handling
      this.on(EVT_PEER_CONNECTED, async peer => {
        await new Promise(resolve => setTimeout(resolve, 500));

        peer.emitSyncEvent(
          SYNC_EVT_PHANTOM_SERVER_SESSION_UPTIME,
          this.getUptime()
        );

        const otherPeers = this.getOtherPeers(peer);

        // Publish common Howler MediaStream
        // TODO: Handle differently
        const howlerAudioTrack = howlerMediaStream.getAudioTracks()[0];
        peer.emitSyncEvent(SYNC_EVT_DEBUG, {
          // TODO: Remove
          id: howlerMediaStream.id,
        });
        peer.addOutgoingMediaStreamTrack(howlerAudioTrack, howlerMediaStream);

        const remoteCapabilities = peer.getRemoteCapabilities();

        // Route all other peers' incoming streams to this peer's outgoing streams
        const outgoingPromises = [];

        for (const otherPeer of otherPeers) {
          const incomingMediaStreams = otherPeer.getIncomingMediaStreams();

          for (const mediaStream of incomingMediaStreams) {
            for (const mediaStreamTrack of mediaStream.getTracks()) {
              const { kind } = mediaStreamTrack;

              if (
                (kind === "audio" &&
                  remoteCapabilities.includes(CAPABILITY_CAN_RECEIVE_AUDIO)) ||
                (kind === "video" &&
                  remoteCapabilities.includes(CAPABILITY_CAN_RECEIVE_VIDEO))
              ) {
                outgoingPromises.push(
                  peer.addOutgoingMediaStreamTrack(
                    mediaStreamTrack,
                    mediaStream
                  )
                );
              }
            }
          }
        }

        await Promise.all(outgoingPromises);

        this.broadcastConnectedSessionInfo();

        // Play start-up chime / participants announcement
        (() => {
          // TODO: Enhance this
          setTimeout(async () => {
            const introSound = new CachedHowl({
              // TODO: Make this dynamic
              src: "/audio-samples/sound-effects/myinstants.com/message/new-message-online-audio-converter.mp3",
              format: "mp3",
            });
            introSound.play();

            await new Promise(resolve => setTimeout(resolve, 1000));

            this.speak(`${peer.getNickname()} has joined the call`);
          }, 250);
        })();
      });

      // MediaStreamTrack added handling
      this.on(
        EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_ADDED,
        // TODO: Handle mediaStream / mediaStreamTrack separation
        async ([peer, { mediaStreamTrack, mediaStream }]) => {
          const outgoingPromises = [];
          const { kind } = mediaStreamTrack;

          // TODO: Remove
          console.log({
            mediaStreamTrack,
            mediaStream,
          });

          const otherPeers = this.getOtherPeers(peer);
          for (const otherPeer of otherPeers) {
            const remoteCapabilities = otherPeer.getRemoteCapabilities();

            if (
              (kind === "audio" &&
                remoteCapabilities.includes(CAPABILITY_CAN_RECEIVE_AUDIO)) ||
              (kind === "video" &&
                remoteCapabilities.includes(CAPABILITY_CAN_RECEIVE_VIDEO))
            ) {
              outgoingPromises.push(
                otherPeer.addOutgoingMediaStreamTrack(
                  mediaStreamTrack,
                  mediaStream
                )
              );
            }
          }

          await Promise.all(outgoingPromises);

          this.broadcastConnectedSessionInfo();
        }
      );

      // MediaStreamTrack removed handling
      this.on(
        EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
        // TODO: Handle mediaStream / mediaStreamTrack separation
        async ([peer, { mediaStreamTrack, mediaStream }]) => {
          const outgoingPromises = [];

          const otherPeers = this.getOtherPeers(peer);
          for (const otherPeer of otherPeers) {
            outgoingPromises.push(
              otherPeer.removeOutgoingMediaStreamTrack(
                mediaStreamTrack,
                mediaStream
              )
            );
          }

          await Promise.all(outgoingPromises);

          this.broadcastConnectedSessionInfo();
        }
      );

      // Sync event handling
      this.on(
        EVT_PEER_MONITOR_SYNC_EVT_RECEIVED,
        async ([fromPeer, { eventName, eventData }]) => {
          switch (eventName) {
            case SYNC_EVT_TTS:
              this.speak(eventData);
              break;

            case SYNC_EVT_MIDI_NOTE:
              this.playMusicalNote(eventData);
              break;

            case SYNC_EVT_CHAT_MESSAGE:
              this.relayChatMessage(fromPeer, eventData);
              break;

            case SYNC_EVT_PHANTOM_EVENT_CHANNEL_QUERY:
              // TODO: Refactor this
              (() => {
                // TODO: Parse this from PhantomEventChannel (i.e. PhantomEventChannel.getReceiver(query))
                const destination = eventData.d;

                // TODO: Receiver could be the Phantom Server itself
                const receiver = this.getPeerWithSocketID(destination);

                if (receiver) {
                  // Proxy the query to the receiving peer
                  receiver.emitSyncEvent(SYNC_EVT_PHANTOM_EVENT_CHANNEL_QUERY, {
                    ...eventData,
                    // TODO: Bake this parameter into PhantomEventChannel receiver
                    s: fromPeer.getSocketID(),
                  });
                }
              })();
              break;

            case SYNC_EVT_PHANTOM_PEER_PUBLIC_STATE_UPDATE:
              // TODO: Refactor this
              (() => {
                const otherPeers = this.getOtherPeers(fromPeer);

                // TODO: Update shared cache
                // TODO: Send shared cache to each new peer when connecting

                for (const peer of otherPeers) {
                  peer.emitSyncEvent(
                    SYNC_EVT_PHANTOM_PEER_PUBLIC_STATE_UPDATE,
                    eventData
                  );
                }
              })();
              break;

            default:
              console.warn(`Unhandled sync event "${eventName}"`, eventData);

              break;
          }
        }
      );

      // Peer disconnect handling
      this.on(EVT_PEER_DISCONNECTED, async peer => {
        this.broadcastConnectedSessionInfo();

        const otherPeers = this.getOtherPeers(peer);
        const lenOtherPeers = Object.values(otherPeers).length;

        // Don't play if no peers at all
        if (lenOtherPeers) {
          const introSound = new CachedHowl({
            src: "/audio-samples/sound-effects/myinstants.com/message/new-message-online-audio-converter.mp3",
            format: "mp3",
          });
          introSound.play();

          await new Promise(resolve => setTimeout(resolve, 1000));

          this.speak(`${peer.getNickname()} has left the call`);
        }
      });

      // Data handling
      this.on(EVT_PEER_DATA_RECEIVED, ([peer, data]) => {
        const otherPeers = this.getOtherPeers(peer);

        // Proxy data from one peer to the other peers
        for (const otherPeer of otherPeers) {
          // Handle remote keyboard transmission to other peers with remote
          // keyboard input capabilities

          const remoteCapabilities = otherPeer.getRemoteCapabilities();

          // TODO: Rework this
          if (
            remoteCapabilities.includes(
              CAPABILITY_REMOTE_KEYBOARD_GAME_INPUT
            ) /* ||
            remoteCapabilities.includes(
              CAPABILITY_REMOTE_KEYBOARD_MUSICAL_INPUT
            )*/
          ) {
            // TODO: Refine to just keyboard input
            otherPeer.send(data);
          }
        }
      });
    })();
  }

  /**
   * Retrieves the number of seconds since the session was first started.
   *
   * @return {number}
   */
  getUptime() {
    const now = new Date().getTime();

    return (now - this._startTime) / 1000;
  }

  /**
   * Broadcasts information about the currently connected participants.
   *
   * TODO: Document
   */
  broadcastConnectedSessionInfo() {
    const _handleSend = () => {
      const sessionInfo = this.getConnectedSessionInfo();

      const peers = this.getPeers();

      for (const peer of peers) {
        // IMPORTANT: Sent as re-encapsulated object so that listener can more
        // easily identify this
        peer.emitSyncEvent(SYNC_EVT_PHANTOM_SESSION_MAP, sessionInfo);
      }
    };

    _handleSend();

    // Send confirmation update after a second in case anything wasn't fully
    // init
    //
    // (TODO: Handle this better; prone to race conditions)
    setTimeout(_handleSend, 1000);
  }

  /**
   * @return {Object} // TODO: Document
   */
  getConnectedSessionInfo() {
    const ret = {};

    const peers = this.getPeers();

    // TODO: Refactor
    ret.peers = [
      {
        id: 0,
        nickname: "Phantom Server",
        isVirtual: true,
        // TODO: Populate
        capabilities: [
          CAPABILITY_CAN_RECEIVE_AUDIO,
          CAPABILITY_CAN_RECEIVE_VIDEO,
        ],
        mediaStreams: [
          {
            id: howlerMediaStream.id,
            trackKinds: ["audio"],
          },
        ],
      },
    ];

    // TODO: Refactor
    for (const peer of peers) {
      const socketID = peer.getSocketID();
      /** @type {ParticipantInfo} // TODO: Document type */
      ret.peers.push({
        id: socketID,
        nickname: peer.getNickname(),
        capabilities: peer.getRemoteCapabilities(),
        isVirtual: false,
        cssColor: peer.getCSSColor(),
        // TODO: Skip streams without tracks
        mediaStreams: peer
          .getIncomingMediaStreams()
          .map(mediaStream => ({
            id: mediaStream.id,
            trackKinds: mediaStream.getTracks().map(({ kind }) => kind),
          }))
          .filter(({ trackKinds }) => trackKinds.length > 0),
      });
    }

    return ret;
  }

  /**
   * Speaks to all connected participants.
   *
   * @param {Object} text_sex
   * @return {Promise<void>}
   */
  async speak(params) {
    // TODO: Remove
    console.log({ params });

    let text;
    let sex = "female";

    if (typeof params === "string") {
      text = params;
    } else {
      text = params.text;
      sex = params.sex;
    }

    const sound = new CachedHowl({
      // TODO: Make tts_server address : port dynamic
      src: `http://tts_server:3000?sex=${encodeURIComponent(
        sex
      )}&text=${encodeURIComponent(text)}`,
      format: "mp3",
    });

    sound.play();
  }

  // TODO: Document
  async playMusicalNote({
    note,
    octaveIdx,
    instrumentId,
    volume = 10,
    release,
  }) {
    // TODO: Rework this
    if (release) {
      return this.stopMusicalNote({
        note,
        octaveIdx,
        instrumentId,
        volume,
        release,
      });
    }

    volume = volume * 0.1;

    const instrument = getInstrumentWithId(instrumentId);

    // TODO: Remove
    console.log({
      instrument,
    });

    if (instrument) {
      const src = instrument.getAudioUrlPath({ note, octaveIdx });

      if (src) {
        const sound = this.getMusicalCachedHowl({ src, volume });

        sound.play();
      }
    }
  }

  // TODO: Document
  // Note: Just like play(), above, but stops at the end
  async stopMusicalNote({ note, octaveIdx, volume = 10, instrumentId }) {
    volume = volume * 0.1;

    const instrument = getInstrumentWithId(instrumentId);

    if (instrument) {
      const src = instrument.getAudioUrlPath({ note, octaveIdx });

      if (src) {
        const sound = this.getMusicalCachedHowl({ src, volume });

        sound.stop();
      }
    }
  }

  // TODO: Move
  getMusicalCachedHowl({ src, format = "wav", volume, ...rest }) {
    return new CachedHowl({
      src,
      format,
      volume,
      ...rest,
    });
  }

  // TODO: Rename
  relayChatMessage(fromPeer, eventData) {
    const otherPeers = this.getOtherPeers(fromPeer);

    // TODO: Make this less hackish
    eventData.senderSocketID = fromPeer.getSocketID();

    for (const peer of otherPeers) {
      peer.emitSyncEvent(SYNC_EVT_CHAT_MESSAGE, eventData);
    }

    const sound = new CachedHowl({
      // TODO: Make tts_server address : port dynamic
      src: `/audio-samples/sound-effects/myinstants.com/message/new-message-online-audio-converter.mp3`,
      format: "mp3",
    });

    sound.play();
  }
}
