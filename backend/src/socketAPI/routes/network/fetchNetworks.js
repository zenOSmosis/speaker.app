import NetworkController from "@src/NetworkController";

/**
 * @return {Promise<Object[]>} // TODO: Document
 */
export default async function fetchNetworks({
  realmId,
  channelId,
  isPublic = true,
}) {
  const networkController = NetworkController.getInstance();

  // TODO: Refactor
  const query = (() => {
    const query = {};
    if (realmId) {
      query.realmId = realmId;
    }
    if (channelId) {
      query.channelId = channelId;
    }
    query.isPublic = isPublic;

    return query;
  })();

  const networks = await networkController.fetchNetworks(query);

  return networks;
}
