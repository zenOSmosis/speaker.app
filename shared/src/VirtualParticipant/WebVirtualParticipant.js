import VirtualParticipant from "./VirtualParticipant";

/**
 * A virtual participant from the perspective of a web browser, or other
 * web-based client device.
 */
export default class WebVirtualParticipant extends VirtualParticipant {
  constructor(socketID, rest = {}) {
    super(socketID, {
      mediaStreamTracks: [],
      mediaStreams: [],
      ...rest,
    });
  }
}
