import { useContext } from "react";
import { ScreenCaptureContext } from "@providers/ScreenCaptureProvider";

export default function useScreenCaptureContext() {
  return useContext(ScreenCaptureContext);
}
