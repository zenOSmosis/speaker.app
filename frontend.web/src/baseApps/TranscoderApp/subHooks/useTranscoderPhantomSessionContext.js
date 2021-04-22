import { useContext } from "react";
import { TranscoderPhantomSessionContext } from "../subProviders/TranscoderPhantomSessionProvider";

export default function useTranscoderPhantomSessionContext() {
  return useContext(TranscoderPhantomSessionContext);
}
