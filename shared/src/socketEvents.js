/**
 * Events which are sent / received over Socket.io.
 *
 * @see socketAPIRoutes.js for additional Socket.io events which expect ack
 * callbacks.
 * @see syncEvents.js for events emit over WebRTC data channel.
 */

/**
 * Emits from the FE to the BE with service authorization.
 *
 * @event client-authorization-granted
 * @type {Object} // TODO: Document structure
 */
export const SOCKET_EVT_CLIENT_AUTHORIZATION_GRANTED =
  "client-authorization-granted";

/**
 * @event zenrtc-signal
 * @type {Object} // TODO: Document structure
 */
export const SOCKET_EVT_ZENRTC_SIGNAL = "zenrtc-signal";

/**
 * Emit from BE to FE when a network has been created, updated, or deleted.
 *
 * At this time, it doesn't currently carry any event information with it.
 *
 * @event networks-updated
 * @type {void}
 */
export const SOCKET_EVT_NETWORKS_UPDATED = "networks-updated";
