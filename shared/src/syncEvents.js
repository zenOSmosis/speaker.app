/**
 * Events which are sent / received over WebRTC data channel (UDP transmission).
 *
 * IMPORTANT: Since these are UDP events, they are not guaranteed to be
 * delivered successfully or accurately, and it is up to the implementation to
 * make its own integrity checks.
 *
 * @see socketEvents.js for events emit over Socket.io.
 */

export const SYNC_EVT_PING = "ping";
export const SYNC_EVT_PONG = "pong";

// Before disconnect
export const SYNC_EVT_BYE = "bye";

// Request other peer to leave
export const SYNC_EVT_KICK = "kick";

/**
 * TODO: Document API structure
 *
 * This was added because SimplePeer doesn't always notify of track removal on
 * its own.
 */
export const SYNC_EVT_TRACK_REMOVED = "mst-";

// TODO: Document
export const SYNC_EVT_DEBUG = "debug";

/**
 * Emits when local peer has a state update.
 */
export const SYNC_EVT_SYNC_OBJECT_UPDATE = "s3";

// TODO: Document
export const SYNC_EVT_SYNC_OBJECT_READ_ONLY_UPDATE_HASH = "s4";

// TODO: Document
export const SYNC_EVT_DATA_CHANNEL_MESSAGE = "d";

/**
 * TODO: Create data channel support
 *
 * Look at this for reference:
 * @see https://github.com/feross/simple-peer/pull/694
 */

// TODO: Add unit test which ensures all of these values are unique
