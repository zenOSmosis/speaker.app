let _instance = null;

export default class SocketAPIClient {
  /**
   * @return {SocketAPIClient}
   */
  static getInstance() {
    if (!_instance) {
      throw new Error(
        "SocketAPIClient instance has not already been established"
      );
    }

    return _instance;
  }

  // TODO: Document
  static getSocket() {
    const client = SocketAPIClient.getInstance();

    return client.getSocket();
  }

  // TODO: Document
  constructor(socket) {
    if (_instance) {
      _instance.socket = socket;

      return _instance;
    } else {
      _instance = this;
    }

    this._socket = socket;
  }

  // TODO: Document
  getSocket() {
    return this._socket;
  }
}
