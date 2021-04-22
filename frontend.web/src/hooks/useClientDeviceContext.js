import { useContext } from "react";
import { ClientDeviceContext } from "@providers/ClientDeviceProvider";

export default function useClientDeviceContext() {
  return useContext(ClientDeviceContext);
}
