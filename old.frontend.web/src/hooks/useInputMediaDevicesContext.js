import { useContext } from "react";
import { InputMediaDevicesContext } from "@providers/InputMediaDevicesProvider";

export default function useInputMediaDevices() {
  return useContext(InputMediaDevicesContext);
}
