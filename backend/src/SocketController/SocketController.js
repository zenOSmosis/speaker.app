import NetworkController, {
  EVT_NETWORK_CREATED,
  EVT_NETWORK_DESTROYED,
  EVT_NETWORK_UPDATED,
} from "@src/NetworkController";
import BackendZenRTCSignalBroker, {
  SOCKET_EVT_ZENRTC_SIGNAL,
} from "@src/BackendZenRTCSignalBroker";
import initSocketAPI from "@src/socketAPI";
import {
  SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED,
  SOCKET_EVT_NETWORKS_UPDATED,
} from "@shared/socketEvents";
import { receiveClientAuthentication } from "@shared/serviceAuthorization/server";

/**
 * @typedef {import('socket.io').Server} Server
 */

// Property which rides on top of socket object (ONLY AVAILABLE ON THIS THREAD)
const KEY_CLIENT_DEVICE_ADDRESS = "__clientDeviceAddress";

// Number of active Socket connections on this CPU core
let _coreConnectionCount = 0;

function _logCoreConnectionCount() {
  const lenCPUConnections = SocketController.getCoreConnectionCount();

  // FIXME: (jh) Include metric for how many total network Socket connections there
  // are

  console.log(
    `Per CPU Socket.io connection count [CPU #${process.env.CPU_NO}]: ${lenCPUConnections}`
  );
}

/**
 * Handles Socket.io authentication, SocketAPI and BackendZenRTCSignalBroker
 * (ZenRTC signal routing) initialization.
 *
 * @abstract (just contains static methods; not ever instantiated)
 */
export default class SocketController {
  /**
   * Retrieves the number of Socket.io connections on this CPU thread.
   *
   * @return {number}
   */
  static getCoreConnectionCount() {
    return _coreConnectionCount;
  }

  /**
   * @param {Server} io Instantiated Socket.io server
   * (@link https://socket.io/docs/v4/server-api/)
   * @return {void}
   */
  static initWithSocketIo(io) {
    io.use((socket, next) => {
      // NOTE: Not waiting for "connect" event to be emit due to authorization
      // event which will follow this (this count is mostly integrated to
      // determine when a good time to restart the server is, and during
      // authorization is not a good time).
      ++_coreConnectionCount;

      // Log connection count after other startup work has been performed
      // FIXME: (jh) Replace w/ setImmediate?
      // @see https://github.com/zenOSmosis/phantom-core/issues/76
      process.nextTick(_logCoreConnectionCount);

      // FIXME: (jh) Use event constant
      socket.on("disconnect", () => {
        --_coreConnectionCount;

        // Log connection count after other cleanup work has been performed
        // FIXME: (jh) Replace w/ setImmediate?
        // @see https://github.com/zenOSmosis/phantom-core/issues/76
        process.nextTick(_logCoreConnectionCount);
      });

      next();
    });

    // Service authorization middleware
    io.use((socket, next) => {
      try {
        const { clientAuthorization, clientDeviceAddress } =
          receiveClientAuthentication(socket.handshake.auth);

        // Tell the client they are authorized
        socket.emit(
          SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED,
          clientAuthorization
        );

        // Add the device address to the socket property so that it can be
        // retrieved elsewhere in the program, so long as within same thread
        socket[KEY_CLIENT_DEVICE_ADDRESS] = clientDeviceAddress;

        next();
      } catch (err) {
        console.error("Caught authentication error", err);

        socket.disconnect();
      }
    });

    // FIXME: (jh) Use event constant
    io.on("connect", async socket => {
      try {
        // IMPORTANT: The network controller shouldn't be shut down on
        // disconnect because it is a singleton
        const networkController = new NetworkController();

        // Preliminary network sync
        //
        // FIXME: (jh) Only emit to interested listeners
        (() => {
          const _handleNetworksUpdated = () => {
            // Broadcast
            io.emit(SOCKET_EVT_NETWORKS_UPDATED);
          };

          networkController.on(EVT_NETWORK_CREATED, _handleNetworksUpdated);
          networkController.on(EVT_NETWORK_UPDATED, _handleNetworksUpdated);
          networkController.on(EVT_NETWORK_DESTROYED, _handleNetworksUpdated);

          // FIXME: (jh) Use event constant
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

        // ZenRTCPeer signaling
        (() => {
          const zenRTCSignalBroker = new BackendZenRTCSignalBroker({
            io,
            socketIdFrom: socket.id,
          });

          // FIXME: (jh) Use event constant
          socket.on("disconnect", () => {
            if (!zenRTCSignalBroker.getIsDestroying()) {
              zenRTCSignalBroker.destroy();
            }
          });

          socket.on(
            SOCKET_EVT_ZENRTC_SIGNAL,
            ({ realmId, channelId, /* serviceEntityTo, */ ...rest }) => {
              zenRTCSignalBroker.signal({
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
}
