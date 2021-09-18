import { useContext } from "react";
import {
  SplitAppMessageBusContext,
  ROLE_MAIN_APP,
  ROLE_TRANSCODER_APP,
  MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
  TRANSCODER_EVT_READY,
  TRANSCODER_EVT_CONNECTED,
  TRANSCODER_EVT_DISCONNECTED,
} from "@providers/SplitAppMessageBusProvider";

export {
  ROLE_MAIN_APP,
  ROLE_TRANSCODER_APP,
  MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
  TRANSCODER_EVT_READY,
  TRANSCODER_EVT_CONNECTED,
  TRANSCODER_EVT_DISCONNECTED,
};

export default function useSplitAppMessageBus() {
  const { splitAppMessageBus } = useContext(SplitAppMessageBusContext);

  return splitAppMessageBus;
}
