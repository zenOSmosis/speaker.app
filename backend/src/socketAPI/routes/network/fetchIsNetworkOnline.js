import NetworkController from "@src/NetworkController";

/**
 * @param {NetworkDBObjectQuery}
 * @param {Object} socketAPIContext
 * @return {Promise<boolean>}
 */
export default async function fetchIsNetworkOnline({ realmId, channelId }) {
  // { io, socket }
  const networkController = NetworkController.getInstance();

  const hostSocketId = await networkController.fetchVirtualServerSocketId({
    realmId,
    channelId,
  });

  // TODO: Remove
  console.log("fetchIsNetworkOnline", hostSocketId);

  // TODO: Return false if socket id is not connected (look up property)

  return Boolean(hostSocketId);
}
