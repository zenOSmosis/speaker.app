import NetworkController from "@src/NetworkController";

/**
 * @param {string} realmId? [default = null] If set, filter to networks with
 * this realmId
 * @param {string} channelId? [default = null] If set, filter to networks with
 * this channelId
 * @param {boolean} isPublic? [default = true]
 * @return {Promise<Object[]>} // TODO: Document
 */
export default async function fetchNetworks({
  realmId = null,
  channelId = null,
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
