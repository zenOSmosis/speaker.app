import VirtualParticipant, {
  EVT_UPDATED,
  EVT_DESTROYED,
} from "./VirtualParticipant";
import VirtualServerVirtualParticipant from "./VirtualServerVirtualParticipant";
import WebVirtualParticipant from "./WebVirtualParticipant";

export default VirtualParticipant;
export {
  EVT_UPDATED,
  EVT_DESTROYED,
  VirtualServerVirtualParticipant,
  WebVirtualParticipant,
};
