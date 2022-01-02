import NetworkController from "@src/NetworkController";

// TODO: Document
export default async function setBackgroundImage(
  { backgroundImage },
  { socket }
) {
  const network = socket[KEY_SOCKET_NETWORK];

  const networkController = NetworkController.getInstance();

  await networkController.setBackgroundImage(network, backgroundImage);
}
