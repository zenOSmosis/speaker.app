import NetworkController from "@src/NetworkController";

/**
 * @param {NetworkDBObjectQuery} // TODO: Import query type
 * @return {Promise<boolean>}
 */
export default async function fetchIsNetworkOnline({ realmId, channelId }) {
  const networkController = NetworkController.getInstance();

  const hostSocketId = await networkController.fetchVirtualServerSocketId({
    realmId,
    channelId,
  });

  // FIXME: (jh) Return false if socket id is not connected; NOTE: Not the "local"
  // socket, the host socket w/ the given hostSocketId; maybe it's io.sockets?
  // Needs a helper method instead of a direct property lookup here.

  return Boolean(hostSocketId);
}
