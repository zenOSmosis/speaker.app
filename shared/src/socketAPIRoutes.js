/**
 * Speaker.app SocketAPI Routes used in SocketAPIClient and BE.
 *
 * Socket.io-based query abstraction layer.
 */

// TODO: Document this better

/**
 * Whatever is sent is returned.
 *
 * @param {any} inbound
 * @return {any} outbound
 */
export const SOCKET_API_ROUTE_LOOPBACK = "loopback";

/**
 * @return {Object[]}
 */
export const SOCKET_API_ROUTE_FETCH_NETWORKS = "fetch-networks";

// TODO: Document
/** @type {boolean} */
export const SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS = "fetch-network-exists";

// TODO: Document
/** @type {Object} */
export const SOCKET_API_ROUTE_FETCH_ICE_SERVERS = "fetch-ice-servers";

// TODO: Document
/** @type {Object} */
export const SOCKET_API_ROUTE_INIT_VIRTUAL_SERVER_SESSION =
  "init-virtualServer-session";

// TODO: Document
/** @type {void} */
export const SOCKET_API_ROUTE_END_VIRTUAL_SERVER_SESSION =
  "end-virtualServer-session";

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
