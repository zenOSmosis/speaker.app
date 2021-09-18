import SplitAppMessageBusProvider, {
  SplitAppMessageBusContext,
} from "./SplitAppMessageBusProvider";
import {
  ROLE_MAIN_APP,
  ROLE_TRANSCODER_APP,
  MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
  TRANSCODER_EVT_READY,
  TRANSCODER_EVT_CONNECTED,
  TRANSCODER_EVT_DISCONNECTED,
} from "./classes/SplitAppMessageBus";

export default SplitAppMessageBusProvider;
export {
  SplitAppMessageBusContext,
  ROLE_MAIN_APP,
  ROLE_TRANSCODER_APP,
  MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
  TRANSCODER_EVT_READY,
  TRANSCODER_EVT_CONNECTED,
  TRANSCODER_EVT_DISCONNECTED,
};
