/**
 * Speaker.app SocketAPI Routes used in SocketAPIClient and BE.
 *
 * Socket.io-based query abstraction layer,
 *
 * For frontend usage, @see SocketIOService.js (fetchSocketAPICall).
 *
 * TODO: Document backend usage
 */

/**
 * NOTE: (jh) This documentation isn't conventional JSDoc, and I'm not yet sure
 * of the best way to go about documenting this.
 * @link https://jsdoc.app/tags-event.html
 *
 * However, in an effort to document it at all, the following is the
 * convention:
 *
 * - (at)event --name-- Represents the event name
 * - (at)type: Represents the request data from the client
 * - (at)property: {function: --type--} ack Represents the response data from
 * the server
 */

/**
 * Whatever is sent is returned.
 *
 * @event loopback
 * @type {any} Data which will be sent to the server
 * @property {function: any} ack Mirrored data which is sent back from the
 * server
 */
export const SOCKET_API_ROUTE_LOOPBACK = "loopback";

// TODO: Document default network types, etc.
/**
 * @event fetch-networks
 * @type {Object | void} Optional object to query networks with
 * TODO: Document structure
 * @property {function: Object[]} ack
 */
export const SOCKET_API_ROUTE_FETCH_NETWORKS = "fetch-networks";

/**
 * @event fetch-network-exists
 * @type {Object} Network query // TODO: Document structure
 * @property {function: boolean} ack
 **/
export const SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS = "fetch-network-exists";

/**
 * @event fetch-ice-servers
 * @type {void}
 * @property {function: Object} ack
 **/
export const SOCKET_API_ROUTE_FETCH_ICE_SERVERS = "fetch-ice-servers";

/**
 * @event init-virtual-server-session
 * @type {Object} // TODO: Document query structure
 * @property {function: void} ack
 **/
export const SOCKET_API_ROUTE_INIT_VIRTUAL_SERVER_SESSION =
  "init-virtualServer-session";

/**
 * @event end-virtual-server-session
 * @type {Object} // TODO: Document query structure
 * @property {function: void} ack
 **/
export const SOCKET_API_ROUTE_END_VIRTUAL_SERVER_SESSION =
  "end-virtual-server-session";

/**
 * @event set-network-participant-count
 * @type {Object} // TODO: Document query structure
 * @property {function: void} ack // TODO: Ensure correct return
 **/
export const SOCKET_API_ROUTE_SET_NETWORK_PARTICIPANT_COUNT =
  "set-network-participant-count";

/**
 * @event generate-profile-avatar
 * @type {Object} // TODO: Document query structure
 * @property {function: string} ack Base64 image representation of avatar
 **/
export const SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR =
  "generate-profile-avatar";

// TODO: Rename to generate-random-profile-name?
/**
 * @event generate-profile-name
 * @type {string}
 * @property {function: string} ack
 **/
export const SOCKET_API_ROUTE_GENERATE_PROFILE_NAME = "generate-profile-name";

// TODO: Rename to generate-random-profile-description?
/**
 * @event generate-profile-description
 * @type {string}
 * @property {function: string} ack
 **/
export const SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION =
  "generate-profile-description";

/**
 * Parse UserAgent strings.
 *
 * @event fetch-device-detection
 * @type {string} userAgent
 * @property {function: Object} ack // TODO: Document object structure
 */
export const SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION = "fetch-device-detection";

/**
 * @event set-network-background-image
 * @type {Object} // TODO: Document query structure
 * @property {function: void} ack // TODO: Ensure correct return
 **/
export const SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE =
  "set-network-background-image";

// TODO: Rename (or remove?) (currently used for searching Unsplash photos)
// TODO: Document
/** @type {Object} */
export const SOCKET_API_ROUTE_MEDIA_SEARCH = "media-search";
