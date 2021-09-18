/**
 * Keys for client-side local storage usage.
 */

/**
 * The number of times the UI has been loaded for the current user on this
 * device.
 *
 * @type {number}
 */
export const KEY_HISTORICAL_SESSION_COUNT = "h0";

/**
 * Contains local profile details.
 *
 * @type {Object}
 */
export const KEY_LOCAL_PROFILE = "p0";

/**
 * Contains local audio defaults.
 *
 * @type {Object}
 */
export const KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE = "ac0";

/**
 * Contains client address and keys.  Should not be shared directly with other
 * peers.
 *
 * @type {Object}
 */
export const KEY_SERVICE_AUTHORIZATION = "a0";

/**
 * Remembers cached form values from previous sessions.
 *
 * @type {Object}
 */
export const KEY_TRANSCODER_LOCAL_STORAGE_CREDS = "t0";

/**
 * Is set to true if the transcoder manually logged out.
 *
 * If the value is set to true, it should prevent the transcoder auto-reconnect
 * mechanism from reconnecting, as part of the design.
 *
 * @type {boolean}
 */
export const KEY_TRANSCODER_DID_MANUALLY_LOGOUT = "m0";
