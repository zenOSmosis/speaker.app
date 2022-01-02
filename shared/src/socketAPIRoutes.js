/**
 * Speaker.app SocketAPI Routes used in SocketAPIClient and BE.
 *
 * Socket.io-based query abstraction layer,
 */

/**
 * Whatever is sent is returned.
 *
 * @event loopback
 * @type {any} Data which will be sent to the server
 * @return {Promise<any>} Mirrored data which is sent back from the server
 */
export const SOCKET_API_ROUTE_LOOPBACK = "loopback";

/**
 * @event fetch-networks
 * @type {Object | void} Optional object to query networks with.
 * TODO: Document structure
 * @return {Promise<Object[]>} // TODO: Document structure
 */
export const SOCKET_API_ROUTE_FETCH_NETWORKS = "fetch-networks";

/**
 * @event fetch-network-exists
 * @type {Object} Network query // TODO: Document structure
 * @return {Promise<boolean>}
 **/
export const SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS = "fetch-network-exists";

/**
 * @event fetch-ice-servers
 * @type {void}
 * @return {Promise<Object>}
 **/
export const SOCKET_API_ROUTE_FETCH_ICE_SERVERS = "fetch-ice-servers";

/**
 * @event init-virtual-server-session
 * @type {Object} // TODO: Document query structure
 * @return {Promise<void>}
 **/
export const SOCKET_API_ROUTE_INIT_VIRTUAL_SERVER_SESSION =
  "init-virtualServer-session";

/**
 * @event end-virtual-server-session
 * @type {Object} // TODO: Document query structure
 * @return {Promise<void>}
 **/
export const SOCKET_API_ROUTE_END_VIRTUAL_SERVER_SESSION =
  "end-virtual-server-session";

// TODO: Document
/** @type {Object} */
export const SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE =
  "set-network-background-image";

// TODO: Document
/** @type {number} */
export const SOCKET_API_ROUTE_SET_NETWORK_PARTICIPANT_COUNT =
  "set-network-participant-count";

// TODO: Document
/** @type {string} */
export const SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR =
  "generate-profile-avatar";

// TODO: Document
/** @type {string} */
export const SOCKET_API_ROUTE_GENERATE_PROFILE_NAME = "generate-profile-name";

// TODO: Document
/** @type {string} */
export const SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION =
  "generate-profile-description";

// TODO: Is this still used?
// TODO: Document
/** @type {Object} */
export const SOCKET_API_ROUTE_MEDIA_SEARCH = "media-search";

/**
 * Parse UserAgent strings.
 *
 * @param {string} userAgent
 * @return {Object} TODO: Document
 */
export const SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION = "fetch-device-detection";
