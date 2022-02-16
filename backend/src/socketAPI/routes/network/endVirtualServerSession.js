import NetworkController from "@src/NetworkController";
import { KEY_SOCKET_NETWORK } from "./__constants";

// TODO: Document
export default async function endVirtualServerSession({}, { socket }) {
  if (socket[KEY_SOCKET_NETWORK]) {
    const networkController = NetworkController.getInstance();

    networkController.deactivateNetwork(socket[KEY_SOCKET_NETWORK]);
  }
}
