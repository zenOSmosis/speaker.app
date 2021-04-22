import { useContext } from "react";
import {
  TranscoderSandboxContext,
  LAUNCH_TARGET_SELF,
  LAUNCH_TARGET_IFRAME,
  LAUNCH_TARGET_NEW_WINDOW,
} from "../subProviders/TranscoderSandboxProvider";

export { LAUNCH_TARGET_SELF, LAUNCH_TARGET_IFRAME, LAUNCH_TARGET_NEW_WINDOW };

export default function useTranscoderSandboxContext() {
  return useContext(TranscoderSandboxContext);
}
