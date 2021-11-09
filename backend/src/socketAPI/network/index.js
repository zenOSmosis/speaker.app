import NetworkController, {
  SERVER_TYPE_EXTERNAL,
} from "@src/NetworkController";

const KEY_SOCKET_NETWORK = "__network";

// TODO: Document
export async function initTranscoderSession(args, { socket }) {
  const networkController = NetworkController.getInstance();

  // TODO: Remove
  console.log({
    args,
  });

  const {
    networkName: name,
    realmID,
    channelID,
    isPublic,
    networkDescription: description,
    deviceAddress: transcoderDeviceAddress,
    userAgent: transcoderUserAgent,
    coreCount: transcoderCoreCount,
    buildHash: transcoderBuildHash,
    maxParticipants,
    maxConcurrentAudioStreams,
    maxConcurrentVideoStreams,
    maxVideoResolution,
  } = args;

  // TODO: try / catch and pipe error to client if not able to establish
  const network = await networkController.createNetwork({
    name,
    realmID,
    channelID,
    isPublic,
    description,
    transcoderType: SERVER_TYPE_EXTERNAL,
    transcoderSocketId: socket.id,
    transcoderDeviceAddress,
    transcoderUserAgent,
    transcoderCoreCount,
    transcoderBuildHash,
    maxParticipants,
    maxConcurrentAudioStreams,
    maxConcurrentVideoStreams,
    maxVideoResolution,
  });

  // Used for endTranscoderSession
  //
  // IMPORTANT: This is only available to the same thead; Do not try to use for
  // other purposes
  socket[KEY_SOCKET_NETWORK] = network;

  // Deregister network if socket has already disconnected
  if (!socket.connected) {
    endTranscoderSession(args, { socket });
  } else {
    // TODO: Remove this event listener when network is destructed
    socket.on("disconnect", () => {
      endTranscoderSession(args, { socket });
    });
  }
}

// TODO: Document
export async function endTranscoderSession({}, { socket }) {
  if (socket[KEY_SOCKET_NETWORK]) {
    const networkController = NetworkController.getInstance();

    networkController.deactivateNetwork(socket[KEY_SOCKET_NETWORK]);
  }
}

/**
 * Records the number of participants for the given network into the database.
 *
 * @param {number} connectedParticipants
 * @param {Object} socketAPIContext
 * @return {Promise<void>}
 */
export async function setConnectedParticipants(
  connectedParticipants,
  { socket }
) {
  const networkController = NetworkController.getInstance();
  const network = socket[KEY_SOCKET_NETWORK];

  if (network) {
    try {
      await networkController.setConnectedParticipants(
        network,
        connectedParticipants
      );
    } catch (err) {
      console.warn("Caught", err);
    }
  } else {
    console.warn(
      `Network is not available to set connected participants for socket ${socket.id}`
    );
  }
}

/**
 * @return {Promise<Object[]>} // TODO: Document
 */
export async function fetchNetworks({ realmID, channelID, isPublic = true }) {
  const networkController = NetworkController.getInstance();

  // TODO: Refactor
  const query = (() => {
    const query = {};
    if (realmID) {
      query.realmID = realmID;
    }
    if (channelID) {
      query.channelID = channelID;
    }
    query.isPublic = isPublic;

    return query;
  })();

  const networks = await networkController.fetchNetworks(query);

  return networks;
}

/**
 * @param {NetworkDBObjectQuery}
 * @param {Object} socketAPIContext
 * @return {Promise<boolean>}
 */
export async function fetchIsNetworkOnline({ realmID, channelID }) {
  // { io, socket }
  const networkController = NetworkController.getInstance();

  const hostSocketId = await networkController.fetchTranscoderSocketId({
    realmID,
    channelID,
  });

  // TODO: Remove
  console.log("fetchIsNetworkOnline", hostSocketId);

  // TODO: Return false if socket id is not connected

  return Boolean(hostSocketId);
}

/**
 * @return {Promise<Object>}
 */
export async function fetchICEServers() {
  const hostname =
    process.env.REACT_APP_COTURN_HOSTNAME || process.env.COTURN_HOSTNAME;

  const username =
    process.env.REACT_APP_COTURN_USERNAME || process.env.COTURN_USERNAME;
  const credential =
    process.env.REACT_APP_COTURN_PASSWORD || process.env.COTURN_PASSWORD;

  // TODO: Document type
  const iceServers = [
    {
      urls: [`turn:${hostname}:3478`, `stun:${hostname}:3478`],
      username,
      credential,
    },
  ];

  return iceServers;
}

// TODO: Document
export async function setBackgroundImage({ backgroundImage }, { socket }) {
  const network = socket[KEY_SOCKET_NETWORK];

  const networkController = NetworkController.getInstance();

  await networkController.setBackgroundImage(network, backgroundImage);
}
