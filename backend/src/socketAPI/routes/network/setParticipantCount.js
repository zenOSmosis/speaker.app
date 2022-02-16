import NetworkController from "@src/NetworkController";
import { KEY_SOCKET_NETWORK } from "./__constants";

/**
 * Records the number of participants for the given network into the database.
 *
 * @param {number} participantCount
 * @param {Object} socketAPIContext
 * @return {Promise<void>}
 */
export default async function setParticipantCount(
  participantCount,
  { socket }
) {
  const networkController = NetworkController.getInstance();
  const network = socket[KEY_SOCKET_NETWORK];

  if (network) {
    try {
      await networkController.setParticipantCount(network, participantCount);
    } catch (err) {
      console.warn("Caught", err);
    }
  } else {
    console.warn(
      `Network is not available to set connected participants for socket ${socket.id}`
    );
  }
}
