import NetworkController from "@src/NetworkController";
import { KEY_SOCKET_NETWORK } from "./__constants";

// TODO: Document
export default async function initVirtualServerSession(props, { socket }) {
  const networkController = NetworkController.getInstance();

  // TODO: Remove
  console.log({
    props,
  });

  const {
    networkName: name,
    realmId,
    channelId,
    isPublic,
    networkDescription: description,
    deviceAddress: virtualServerDeviceAddress,
    userAgent: virtualServerUserAgent,
    coreCount: virtualServerCoreCount,
    buildHash: virtualServerBuildHash,
    maxParticipants,
    maxConcurrentAudioStreams,
    maxConcurrentVideoStreams,
    maxVideoResolution,
  } = props;

  // TODO: try / catch and pipe error to client if not able to establish
  const network = await networkController.createNetwork({
    name,
    realmId,
    channelId,
    isPublic,
    description,
    virtualServerSocketId: socket.id,
    virtualServerDeviceAddress,
    virtualServerUserAgent,
    virtualServerCoreCount,
    virtualServerBuildHash,
    maxParticipants,
    maxConcurrentAudioStreams,
    maxConcurrentVideoStreams,
    maxVideoResolution,
  });

  // Used for endVirtualServerSession
  //
  // IMPORTANT: This is only available to the same thead; Do not try to use for
  // other purposes
  socket[KEY_SOCKET_NETWORK] = network;

  // Deregister network if socket has already disconnected
  if (!socket.connected) {
    endVirtualServerSession(props, { socket });
  } else {
    // TODO: Remove this event listener when network is destructed
    socket.on("disconnect", () => {
      endVirtualServerSession(props, { socket });
    });
  }
}
