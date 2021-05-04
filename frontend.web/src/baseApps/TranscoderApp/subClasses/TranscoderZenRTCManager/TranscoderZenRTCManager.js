import PhantomCore, { EVT_DESTROYED } from "phantom-core";
import TranscoderZenRTCPeer, {
  EVT_UPDATED,
  // EVT_CONNECTING,
  EVT_CONNECTED,
  EVT_DISCONNECTED,
  // EVT_DATA_RECEIVED,
  // EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  // EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  // EVT_SYNC_EVT_RECEIVED,
  EVT_ZENRTC_SIGNAL,
} from "@baseApps/TranscoderApp/subClasses/TranscoderZenRTCPeer";

import SyncObject from "sync-object";

import { fetch } from "@shared/SocketAPIClient";
import { SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE } from "@shared/socketAPIRoutes";

import TranscoderIPCMessageBroker, {
  TYPE_WEB_IPC_MESSAGE,
} from "../TranscoderIPCMessageBroker";

import { TranscoderVirtualParticipant } from "@shared/VirtualParticipant";

// import { uniqBy } from "lodash";

export { EVT_UPDATED, EVT_DESTROYED };

export const EVT_PEER_CONNECTED = "peer-connected";
export const EVT_PEER_DISCONNECTED = "peer-disconnected";
export const EVT_PEER_DESTROYED = "peer-destroyed";
export const EVT_PEER_UPDATED = "peer-updated";

let _instance = null;

// TODO: Use secured indexeddb for storing of messages, etc.
// (i.e. something like: https://github.com/AKASHAorg/secure-webstore)

/**
 * Manages the creation, updating, and destroying of TranscoderZenRTC instances.
 */
export default class TranscoderZenRTCManager extends PhantomCore {
  constructor({ realmId, channelId, hostDeviceAddress, socket }) {
    super();

    // Destroy previous instance
    //
    // TODO: Document why we want to destroy instead of retain it as a
    // singleton
    if (_instance) {
      console.warn(`Destroying previous ${this.getClassName()} instance`);

      _instance.destroy();
    }

    _instance = this;

    this._realmId = realmId;
    this._channelId = channelId;
    this._socket = socket;
    this._hostDeviceAddress = hostDeviceAddress;

    this._transcoderZenRTCInstances = {};

    // TODO: Use local storage sync object, or web worker based
    // Shared between all peers
    this._sharedWritableSyncObject = new SyncObject({
      backgroundImage: null,

      peers: {},

      // chatMessages: [],
    });

    // Handle all incoming WebIPC messages
    (() => {
      const _handleReceiveIPCMessage = data => {
        const { socketIoIdFrom, senderDeviceAddress } = data;

        const zenRTCPeer = this._getOrCreateTranscoderZenRTCInstance(
          socketIoIdFrom,
          senderDeviceAddress
        );

        zenRTCPeer.receiveZenRTCSignal(data);
      };

      // TODO: Check realm / channel integrity before starting up zenRTCInstance?

      socket.on(TYPE_WEB_IPC_MESSAGE, _handleReceiveIPCMessage);

      this.once(EVT_DESTROYED, () => {
        socket.off(TYPE_WEB_IPC_MESSAGE, _handleReceiveIPCMessage);
      });
    })();

    this._networkName = null;
    this._networkDescription = null;

    this._peerHasConnected = this._peerHasConnected.bind(this);
    this._peerHasUpdated = this._peerHasUpdated.bind(this);
    this._peerHasDisconnected = this._peerHasDisconnected.bind(this);
    this._peerHasDestroyed = this._peerHasDestroyed.bind(this);

    this._syncPeerData = this._syncPeerData.bind(this);
    this._syncLinkedMediaState = this._syncLinkedMediaState.bind(this);
  }

  setNetworkData({ networkName, networkDescription }) {
    this._networkName = networkName;
    this._networkDescription = networkDescription;

    this.emit(EVT_UPDATED);
  }

  /**
   * Called when the given peer has connected.
   *
   * @param {TranscoderZenRTCPeer} transcoderZenRTCPeer
   * @return {void}
   */
  _peerHasConnected(transcoderZenRTCPeer) {
    this.emit(EVT_PEER_CONNECTED, transcoderZenRTCPeer);

    // Map streams from other peers to this peer
    (() => {
      const otherPeers = transcoderZenRTCPeer.getOtherThreadInstances();

      otherPeers.forEach(otherPeer => {
        otherPeer
          .getIncomingMediaStreams()
          .forEach(mediaStream =>
            mediaStream
              .getTracks()
              .forEach(mediaStreamTrack =>
                transcoderZenRTCPeer.addOutgoingMediaStreamTrack(
                  mediaStreamTrack,
                  mediaStream
                )
              )
          );
      });
    })();
  }

  /**
   * Called when the given peer has updated.
   *
   * @param {TranscoderZenRTCPeer} transcoderZenRTCPeer
   */
  _peerHasUpdated(transcoderZenRTCPeer) {
    this.emit(EVT_PEER_UPDATED, transcoderZenRTCPeer);
  }

  // TODO: Document
  _peerHasDisconnected(transcoderZenRTCPeer) {
    this.emit(EVT_PEER_DISCONNECTED, transcoderZenRTCPeer);
  }

  // TODO: Document
  _peerHasDestroyed(transcoderZenRTCPeer) {
    this.emit(EVT_PEER_DESTROYED, transcoderZenRTCPeer);
  }

  /**
   * Gets, or creates, TranscoderZenRTCPeer associated with the given
   * socketIoId.
   *
   * @param {string} initiatorSocketIoId
   * @param {string} initiatorDeviceAddress
   * @return {TranscoderZenRTCPeer} Returns a new, or cached, instance.
   */
  _getOrCreateTranscoderZenRTCInstance(
    initiatorSocketIoId,
    initiatorDeviceAddress
  ) {
    if (this._transcoderZenRTCInstances[initiatorSocketIoId]) {
      // Retrieve cached instance
      return this._transcoderZenRTCInstances[initiatorSocketIoId];
    } else {
      // Create new instance

      /**
       * Read the remote participant.
       */
      const readOnlySyncObject = new TranscoderVirtualParticipant(
        initiatorDeviceAddress,
        initiatorSocketIoId
      );

      const virtualParticipant = readOnlySyncObject;

      const transcoderZenRTCPeer = new TranscoderZenRTCPeer({
        socketIoId: initiatorSocketIoId,
        // NOTE: The writable is shared between all of the participants and
        // does not represent a single participant (it symbolized all of them)
        writableSyncObject: this._sharedWritableSyncObject,
        readOnlySyncObject,
      });

      this._transcoderZenRTCInstances[
        initiatorSocketIoId
      ] = transcoderZenRTCPeer;

      // Set up IPC message routing
      (() => {
        const ipcMessageBroker = new TranscoderIPCMessageBroker({
          realmId: this._realmId,
          channelId: this._channelId,
          socket: this._socket,
          socketIoIdTo: initiatorSocketIoId,
          socketIoIdFrom: this._socket.id,
        });

        transcoderZenRTCPeer.on(EVT_ZENRTC_SIGNAL, data =>
          ipcMessageBroker.sendMessage(data)
        );

        transcoderZenRTCPeer.once(EVT_DESTROYED, () => {
          // IMPORTANT: Don't destroy the writable here as it is shared between
          // the other peers

          // TODO: Verify if any remaining sockets exist for the given
          // participant and delete, if not

          // Unbind ipcMessageBroker
          ipcMessageBroker.destroy();
        });
      })();

      // Carry profile and other shared information over to other peers
      //
      // Note the written object is sometimes augmented by internal calls to
      // this._syncLinkedMediaState()
      (() => {
        virtualParticipant.on(EVT_UPDATED, updatedState =>
          this._syncPeerData(
            virtualParticipant,
            initiatorSocketIoId,
            updatedState
          )
        );
      })();

      // Handle connect / disconnect peer bindings
      transcoderZenRTCPeer.on(EVT_CONNECTED, () => {
        this._peerHasConnected(transcoderZenRTCPeer);

        this._syncLinkedMediaState();
      });

      transcoderZenRTCPeer.on(EVT_UPDATED, () =>
        this._peerHasUpdated(transcoderZenRTCPeer)
      );

      transcoderZenRTCPeer.on(EVT_DISCONNECTED, () => {
        this._syncRemovedVirtualParticipant(
          virtualParticipant,
          initiatorSocketIoId
        );

        this._peerHasDisconnected(transcoderZenRTCPeer);
      });

      transcoderZenRTCPeer.once(EVT_DESTROYED, () => {
        // Unregister zenRTCPeerEVT_CONNECTED
        delete this._transcoderZenRTCInstances[initiatorSocketIoId];

        this._peerHasDestroyed(transcoderZenRTCPeer);
      });

      // Handle media stream routing
      //
      // TODO: Extract into class method
      (() => {
        // Sync new tracks with new peer
        transcoderZenRTCPeer.on(
          EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
          async data => {
            const otherPeers = transcoderZenRTCPeer.getOtherThreadInstances();

            // TODO: Remove
            console.log("incoming stream track added", {
              data,
              otherPeers,
            });

            await Promise.all(
              otherPeers.map(peer =>
                peer.addOutgoingMediaStreamTrack(
                  data.mediaStreamTrack,
                  data.mediaStream
                )
              )
            );

            this._syncLinkedMediaState();
          }
        );

        // TODO: Extract into class method
        // Sync removed tracks with new peer
        transcoderZenRTCPeer.on(
          EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
          async data => {
            const otherPeers = transcoderZenRTCPeer.getOtherThreadInstances();

            console.log("incoming stream track removed", {
              data,
              otherPeers,
            });

            await Promise.all(
              otherPeers.map(peer =>
                peer.removeOutgoingMediaStreamTrack(
                  data.mediaStreamTrack,
                  data.mediaStream
                )
              )
            );

            this._syncLinkedMediaState();
          }
        );
      })();

      // Automatically connect
      transcoderZenRTCPeer.connect();

      return transcoderZenRTCPeer;
    }
  }

  /**
   * Sync peer data (except for streaming media information) / chosen
   * background with other peers.
   *
   * @param {SyncObject} virtualParticipant
   * @param {string} socketIoId
   * @param {Object} updatedState
   * @return {void}
   */
  _syncPeerData(virtualParticipant, socketIoId, updatedState) {
    this.log.debug("Syncing virtual participant", virtualParticipant);

    // TODO: Remove
    /*
    console.log({
      socketIoId,
      updatedState,
      virtualParticipant,
      vp: virtualParticipant && virtualParticipant.getState(),
    });
    */

    // All peers will receive this
    const syncUpdate = {
      peers: {
        [socketIoId]: updatedState,
      },
    };

    // The background image
    if (updatedState.backgroundImage) {
      syncUpdate.backgroundImage = updatedState.backgroundImage;

      // Log to database so it can be visible on searched networks
      //
      // NOTE: Intentionally not awaiting fetch to resolve
      fetch(SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE, {
        backgroundImage: updatedState.backgroundImage,
      });

      // TODO: Cache in local storage
    }

    if (Object.keys(updatedState).length) {
      this._sharedWritableSyncObject.setState(syncUpdate);
    }

    return;

    // TODO: Remove following

    this._sharedWritableSyncObject.setState({
      // ...prevSharedWritableState,

      // backgroundImage,

      // Peers are delineated by their socketIoId
      /*
      peers: {
        ...prevSharedWritableState.peers,

        // TODO: Branch using deviceAddress
        [socketIoId]: {
          ...prevSharedWritableState.peers[socketIoId],

          // The received data is only relevant to this peer
          // ...updatedState,
          //
          // TODO: Remove array
          ...{ ...virtualParticipant.getState(), 
            // socketIoIds: []
          },

          // Prevent possible media overwrites (these are written via
          // internal calls to this._syncLinkedMediaState())
          // media: {
          //  ...prevState.peers[socketIoId].media,
          // },

          // Don't resync here (merged in common chatMessages)
          // chatMessages: undefined,
        // },
      // },
      */

      // TODO: Sync network details

      // Chat messages from all of the peers
      /*
      chatMessages: uniqBy(
        [
          ...(prevSharedWritableState.chatMessages || []),
          ...(updatedState.chatMessages || []).filter(message =>
            Boolean(message)
          ),
        ],
        "id"
      ),
      */

      // TODO: Set somewhere else and don't update on each run
      networkData: {
        realmId: this._realmId,
        channelId: this._channelId,
        networkName: this._networkName,
        networkDescription: this._networkDescription,
        hostDeviceAddress: this._hostDeviceAddress,
      },
    });

    // TODO: Remove
    /*
    console.log({
      chatMessages: this._sharedWritableSyncObject.getState().chatMessages,
    });
    */
  }

  /**
   * Sync incoming media streaming information with other peers.
   *
   * @return {void}
   */
  _syncLinkedMediaState() {
    // const { peers } = this._sharedWritableSyncObject.getState() || {};
    const peers = {};

    for (const peer of TranscoderZenRTCPeer.getInstances()) {
      const socketIoId = peer.getSocketIoId();

      /**
       * @type {string} CSV representation of incoming media stream ids
       */
      const media = peer
        .getIncomingMediaStreams()
        .map(({ id }) => id)
        .join(",");

      // const media = (peers[socketIoId] && peers[socketIoId].media) || {};

      // Initiate existing media streams as null in case of removed stream
      /*
      Object.keys(media).forEach(mediaStreamId => {
        media[mediaStreamId] = null;
      });
      */

      /*
      Object.values(peer.getMediaIO().incoming).forEach(
        ({ mediaStreamTrack, mediaStream }) => {
          if (!media[mediaStream.id]) {
            // Temporary array
            media[mediaStream.id] = [];
          }

          media[mediaStream.id].push(mediaStreamTrack.kind);
        }
      );
      */

      // De-dupe media types and convert to CSV
      /*
      Object.keys(media).forEach(mediaStreamId => {
        //
        // Convert temporary array to de-duped CSV.
        // 
        //  @type {string} CSV representation of track kinds for the current
        //  MediaStream
        // 
        let kinds = [...new Set(media[mediaStreamId])].join(",");

        if (!kinds.length) {
          kinds = null;
        }

        media[mediaStreamId] = kinds;
      });
      */

      peers[socketIoId] = {
        // ...peers[socketIoId],
        media,
      };
    }

    this._sharedWritableSyncObject.setState({
      peers,
    });
  }

  // TODO: Document
  _syncRemovedVirtualParticipant(virtualParticipant, socketIoId) {
    this.log.debug("Removing virtual participant", virtualParticipant);

    this._sharedWritableSyncObject.setState({
      peers: {
        [socketIoId]: null,
      },
    });
  }

  /**
   * Retrieves all TranscoderZenRTCPeer instances defined in this thread.
   *
   * @return {TranscoderZenRTCPeer[]}
   */
  getPeers() {
    return Object.values(this._transcoderZenRTCInstances);
  }

  async destroy() {
    // Destroy all associated zenRTC peers
    await Promise.all(
      Object.values(this._transcoderZenRTCInstances).map(zenRTCPeer =>
        zenRTCPeer.destroy()
      )
    );

    if (this._sharedWritableSyncObject) {
      await this._sharedWritableSyncObject.destroy();
    }

    super.destroy();
  }
}
