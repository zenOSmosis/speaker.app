/**
 * @return {Promise<Object>}
 */
export default async function fetchICEServers() {
  const hostname = process.env.COTURN_HOSTNAME;

  const username = process.env.COTURN_USERNAME;
  const credential = process.env.COTURN_PASSWORD;

  // TODO: Document type
  const iceServers = [
    {
      // TODO: Don't hardcode ports
      urls: [`turn:${hostname}:3478`, `stun:${hostname}:3478`],
      username,
      credential,
    },
  ];

  return iceServers;
}
