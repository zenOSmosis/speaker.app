import { useContext } from "react";
import { SocketContext } from "@providers/SocketProvider";

export default function useSocketContext() {
  return useContext(SocketContext);
}
