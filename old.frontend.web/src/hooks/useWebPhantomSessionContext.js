import { useContext } from "react";
import { WebPhantomSessionContext } from "@providers/WebPhantomSessionProvider";

export default function useWebPhantomSessionContext() {
  return useContext(WebPhantomSessionContext);
}
