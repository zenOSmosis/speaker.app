import {
  SOCKET_API_ROUTE_LOOPBACK,
  SOCKET_API_ROUTE_FETCH_NETWORKS,
  SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS,
  SOCKET_API_ROUTE_INIT_TRANSCODER_SESSION,
  SOCKET_API_ROUTE_CAPTURE_NETWORK_TOTAL_PARTICIPANTS,
  SOCKET_API_ROUTE_END_TRANSCODER_SESSION,
  SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE,
  SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR,
  SOCKET_API_ROUTE_GENERATE_PROFILE_NAME,
  SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION,
  SOCKET_API_ROUTE_MEDIA_SEARCH,
  SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION,
} from "@shared/socketAPIRoutes";

import {
  initTranscoderSession,
  setConnectedParticipants,
  endTranscoderSession,
  fetchNetworks,
  fetchIsNetworkOnline,
  setBackgroundImage,
} from "./network";

import { searchMedia } from "./media";

import { generateAvatar, generateName, generateDescription } from "./profile";

import { parseUserAgent } from "./device";

/**
 * @param {Object} io
 * @param {Object} socket
 */
export default function initSocketAPI(io, socket) {
  console.log(`HELLO to socket id: ${socket.id}`);

  // Per-socket SocketAPI task number
  let _taskNumber = -1;

  /**
   * Wrapper around inbound Socket.io events which provides a common interface
   * for error handling and responses.
   *
   * @param {string} routeName
   * @param {Function} routeHandler
   */
  const addSocketAPIRoute = (routeName, routeHandler) => {
    // Socket.io event from demo.frontend
    //
    // TODO: Use single socket event for all routes
    socket.on(routeName, async (clientArgs = {}, ack) => {
      ++_taskNumber;

      if (!ack) {
        ack = () => null;
      }

      let error = null;
      let resp = null;

      try {
        console.log(
          `"${socket.id}" SocketAPI task ${_taskNumber} (${routeName}) started`
        );

        // Run the task associated w/ the API route
        resp = await routeHandler(clientArgs, {
          io,
          socket,
        });
      } catch (err) {
        console.error(err);

        error = err;
      } finally {
        // Basic error serialization
        //
        // Note: There is also this library https://www.npmjs.com/package/serialize-error
        // but I don't think it should be used here
        const errMessage = !error
          ? null
          : error && error.message
          ? error.message
          : error;

        // Response w/ tuple-like, [error, response] signature
        ack([errMessage, resp]);

        // TODO: SocketAPI error message is currently not included in the
        // console for potential information leak and needs to be considered
        // how to integrate.

        // TODO: Measure time spent performing task?
        // @see https://nodejs.org/api/perf_hooks.html#perf_hooks_performance_measurement_apis

        console[!errMessage ? "log" : "error"](
          `"${socket.id}" SocketAPI task ${_taskNumber} (${routeName}) ended ${
            !errMessage ? "successfully" : "unsuccessfully"
          }`
        );
      }
    });
  };

  // Loopback - Whatever is sent is returned
  addSocketAPIRoute(SOCKET_API_ROUTE_LOOPBACK, data => {
    return data;
  });

  // TODO: Add query interface
  addSocketAPIRoute(SOCKET_API_ROUTE_FETCH_NETWORKS, fetchNetworks);

  addSocketAPIRoute(
    SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS,
    fetchIsNetworkOnline
  );

  // TODO: Extend to handle mesh networks
  addSocketAPIRoute(
    SOCKET_API_ROUTE_INIT_TRANSCODER_SESSION,
    initTranscoderSession
  );

  addSocketAPIRoute(
    SOCKET_API_ROUTE_CAPTURE_NETWORK_TOTAL_PARTICIPANTS,
    setConnectedParticipants
  );

  // TODO: Extend to handle mesh networks
  addSocketAPIRoute(
    SOCKET_API_ROUTE_END_TRANSCODER_SESSION,
    endTranscoderSession
  );

  addSocketAPIRoute(
    SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE,
    setBackgroundImage
  );

  addSocketAPIRoute(SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR, generateAvatar);

  addSocketAPIRoute(SOCKET_API_ROUTE_GENERATE_PROFILE_NAME, generateName);

  addSocketAPIRoute(
    SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION,
    generateDescription
  );

  addSocketAPIRoute(SOCKET_API_ROUTE_MEDIA_SEARCH, searchMedia);

  addSocketAPIRoute(SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION, parseUserAgent);

  socket.on("disconnect", () => {
    console.log(`BYE to socket id: ${socket.id}`);
  });
}
