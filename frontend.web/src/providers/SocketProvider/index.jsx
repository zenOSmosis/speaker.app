import SocketProvider, { SocketContext } from "./SocketProvider";
import {
  EVT_CONNECT,
  EVT_CONNECT_ERROR,
  EVT_DISCONNECT,
  EVT_RECONNECT_ATTEMPT,
} from "./socketConstants";

export default SocketProvider;
export {
  SocketContext,
  EVT_CONNECT,
  EVT_CONNECT_ERROR,
  EVT_DISCONNECT,
  EVT_RECONNECT_ATTEMPT,
};
