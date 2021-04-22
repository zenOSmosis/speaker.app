import { useContext } from "react";
import { ZenRTCContext } from "@providers/WebZenRTCProvider";

// TODO: Rename to (and use) useWebWebPhantomSessionContext
export default function useZenRTCContext() {
  return useContext(ZenRTCContext);
}
