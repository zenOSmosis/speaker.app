/**
 * Speaker.app SocketAPI Routes used in SocketAPIClient and BE.
 *
 * Socket.io-based query abstraction layer,
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
 *
 * IMPORTANT: Though a reasonable attempt to document these properties was
 * made, there is no guarantee that the properties are / will be current, and
 * the actual usages of these should be handled in a single wrapper, per route.
 * Having the implementation in one place is the sole source of truth for how
 * these properties are actually utilized.
 *
 * As a final word, many objects in here don't have their schemas documented
 * simply for the sake that maintaining them here would be more trouble than
 * it's worth than to just look up the token (event constant name) directly and
 * see how it's utilized throughout the program. There should not be many
 * instances of any of them, typically one for the frontend and another for the
 * backend, with the exception of this "shared" file.
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

/**
 * @event fetch-networks
 * @type {Object | void} Optional object to query networks with
 * @property {string} realmId? [default = null]
 * @property {string} channelId? [default = null]
 * @property {boolean} isPublic? [default = true]
 *
 * @property {function: Object[]} ack
 */
export const SOCKET_API_ROUTE_FETCH_NETWORKS = "fetch-networks";

/**
 * @event fetch-network-exists
 * @type {Object} Network query
 * @property {string} realmId Query realmId
 * @property {string} channelId Query channelId
 *
 * @property {function: boolean} ack
 **/
export const SOCKET_API_ROUTE_FETCH_NETWORK_EXISTS = "fetch-network-exists";

/**
 * @event fetch-ice-servers
 * @type {void}
 * @property {Object[]} iceServers
 * // NOTE: The following represent a single iceServer element
 * @property {string[]} iceServers.urls
 * @property {string} iceServers.username
 * @property {string} iceServers.credential
 *
 * @property {function: Object} ack
 **/
export const SOCKET_API_ROUTE_FETCH_ICE_SERVERS = "fetch-ice-servers";

/**
 * Signals to the backend that the virtual server wishes to start its session.
 *
 * IMPORTANT: This should only be utilized by the virtual server.
 *
 * @event init-virtual-server-session
 * @type {Object}
 *
 * @property {function: void} ack
 **/
export const SOCKET_API_ROUTE_INIT_VIRTUAL_SERVER_SESSION =
  "init-virtualServer-session";

/**
 * Signals to the backend that the virtual server is ending its session.
 *
 * IMPORTANT: This should only be utilized by the virtual server.
 *
 * @event end-virtual-server-session
 * @type {Object}
 *
 * @property {function: void} ack
 **/
export const SOCKET_API_ROUTE_END_VIRTUAL_SERVER_SESSION =
  "end-virtual-server-session";

/**
 * Sets the participant count for the given network.
 *
 * IMPORTANT: This should only be utilized by the virtual server.
 *
 * @event set-network-participant-count
 * @type {Object}
 *
 * @property {function: void} ack
 **/
export const SOCKET_API_ROUTE_SET_NETWORK_PARTICIPANT_COUNT =
  "set-network-participant-count";

/**
 * Generates a profile avatar.
 *
 * @event generate-profile-avatar
 * @type {Object}
 *
 * @property {function: string} ack Base64 image representation of avatar
 **/
export const SOCKET_API_ROUTE_GENERATE_PROFILE_AVATAR =
  "generate-profile-avatar";

/**
 * Generates a random profile name.
 *
 * @event generate-profile-name
 * @type {string}
 *
 * @property {function: string} ack
 **/
export const SOCKET_API_ROUTE_GENERATE_PROFILE_NAME = "generate-profile-name";

/**
 * Generates a random profile description.
 *
 * @event generate-profile-description
 * @type {string}
 *
 * @property {function: string} ack
 **/
export const SOCKET_API_ROUTE_GENERATE_PROFILE_DESCRIPTION =
  "generate-profile-description";

/**
 * Parse a UserAgent string.
 *
 * @event fetch-device-detection
 * @type {string} userAgent
 *
 * @property {function: Object} ack
 */
export const SOCKET_API_ROUTE_FETCH_DEVICE_DETECTION = "fetch-device-detection";

/**
 * @event set-network-background-image
 * @type {Object}
 *
 * @property {function: void} ack
 **/
export const SOCKET_API_ROUTE_SET_NETWORK_BACKGROUND_IMAGE =
  "set-network-background-image";

/**
 * @event media-search
 * @type {Object}
 *
 * @property {function: Object} ack
 **/
export const SOCKET_API_ROUTE_MEDIA_SEARCH = "media-search";
