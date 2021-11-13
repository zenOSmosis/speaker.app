import NetworkController, {
  EVT_NETWORK_CREATED,
  EVT_NETWORK_DESTROYED,
  EVT_NETWORK_UPDATED,
} from "@src/NetworkController";
import BackendZenRTCSignalBroker, {
  TYPE_WEB_IPC_MESSAGE,
} from "@src/BackendZenRTCSignalBroker";
import initSocketAPI from "@src/socketAPI";
import {
  SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED,
  SOCKET_EVT_NETWORKS_UPDATED,
} from "@shared/socketEvents";
import { receiveHandshakeAuthentication } from "@shared/adapters/serviceAuthorization/server";

// Property which rides on top of socket object (ONLY AVAILABLE ON THIS THREAD)
const KEY_CLIENT_DEVICE_ADDRESS = "__clientDeviceAddress";

// Number of active Socket connections on this CPU core
let _coreConnectionCount = 0;

function _logCoreConnectionCount() {
  const lenCPUConnections = SocketController.getCoreConnectionCount();

  // TODO: Include metric for how many total network Socket connections there
  // are

  console.log(
    `Per CPU Socket.io connection count [CPU #${process.env.CPU_NO}]: ${lenCPUConnections}`
  );
}

/**
 * Handles Socket.io connectivity and signal routing.
 */
export default class SocketController {
  /**
   * Retrieves the number of Socket.io connections on this CPU.
   *
   * @return {number}
   */
  static getCoreConnectionCount() {
    return _coreConnectionCount;
  }

  static initWithSocketIo(io) {
    io.use((socket, next) => {
      // NOTE: Not waiting for "connect" event to be emit due to authorization
      // event which will follow this (this count is mostly integrated to
      // determine when a good time to restart the server is, and during
      // authorization is not a good time).
      ++_coreConnectionCount;

      // Log connection count after other startup work has been performed
      // TODO: Replace w/ setImmediate?
      // @see https://github.com/zenOSmosis/phantom-core/issues/76
      process.nextTick(_logCoreConnectionCount);

      socket.on("disconnect", () => {
        --_coreConnectionCount;

        // Log connection count after other cleanup work has been performed
        // TODO: Replace w/ setImmediate?
        // @see https://github.com/zenOSmosis/phantom-core/issues/76
        process.nextTick(_logCoreConnectionCount);
      });

      next();
    });

    // Service authorization middleware
    io.use((socket, next) => {
      try {
        const { clientAuthorization, clientDeviceAddress } =
          receiveHandshakeAuthentication(socket.handshake.auth);

        socket.emit(
          SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED,
          clientAuthorization
        );

        socket[KEY_CLIENT_DEVICE_ADDRESS] = clientDeviceAddress;

        next();
      } catch (err) {
        // TODO: Handle different error types here

        console.warn("Caught authentication error", err);

        // TODO: Use string constant here
        next(new Error("Authentication error"));
      }
    });

    io.on("connect", async socket => {
      try {
        const networkController = new NetworkController();

        // Preliminary network sync
        //
        // TODO: Only emit to interested listeners
        (() => {
          const _handleNetworksUpdated = () => {
            // Broadcast
            io.emit(SOCKET_EVT_NETWORKS_UPDATED);
          };

          networkController.on(EVT_NETWORK_CREATED, _handleNetworksUpdated);
          networkController.on(EVT_NETWORK_UPDATED, _handleNetworksUpdated);
          networkController.on(EVT_NETWORK_DESTROYED, _handleNetworksUpdated);

          socket.on("disconnect", () => {
            networkController.off(EVT_NETWORK_CREATED, _handleNetworksUpdated);
            networkController.off(EVT_NETWORK_UPDATED, _handleNetworksUpdated);
            networkController.off(
              EVT_NETWORK_DESTROYED,
              _handleNetworksUpdated
            );

            console.log(`Socket.io client disconnected with id ${socket.id}`);
          });
        })();

        // TODO: Move to SocketAPI route
        //
        // IPC message broker
        //
        // Mainly used for routing WebRTC signals to peers
        (() => {
          const zenRTCSignalBroker = new BackendZenRTCSignalBroker({
            io,
            socketIdFrom: socket.id,
          });

          socket.on("disconnect", () => {
            zenRTCSignalBroker.destroy();
          });

          socket.on(
            TYPE_WEB_IPC_MESSAGE,
            ({ realmId, channelId, /* serviceEntityTo, */ ...rest }) => {
              zenRTCSignalBroker.sendMessage({
                realmId,
                channelId,
                senderDeviceAddress: socket[KEY_CLIENT_DEVICE_ADDRESS],
                ...rest,
              });
            }
          );
        })();

        // Initialize SocketAPI for all connected clients
        initSocketAPI(io, socket);
      } catch (err) {
        console.error(err);

        socket.disconnect();
      }
    });
  }

  /**
   * Consideration: Surely this isn't very memory efficient?
   *
   * @param {string} socketId
   * @param {Object} io // TODO: Document
   */
  static getSocketWithId(socketId, io) {
    return io.sockets.clients().connected[socketId];
  }

  /**
   * @param {Object} socket
   * @return {string}
   */
  static getSocketDeviceAddress(socket) {
    return socket[KEY_CLIENT_DEVICE_ADDRESS];
  }
}
