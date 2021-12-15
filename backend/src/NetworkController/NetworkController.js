import os from "os";
import PhantomCore, { EVT_READY } from "phantom-core";
import mongoose from "mongoose";
import sleep from "@shared/sleep";

// const { ObjectId } = mongoose;

const {
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_APP_DB_NAME,
  MONGO_APP_USERNAME,
  MONGO_APP_PASSWORD,
} = process.env;

export { EVT_READY };

export const SERVER_TYPE_INTERNAL = "internal";
export const SERVER_TYPE_EXTERNAL = "external";

export const EVT_NETWORK_CREATED = "network-created";
export const EVT_NETWORK_UPDATED = "network-updated";
export const EVT_NETWORK_DESTROYED = "network-destroyed";

let _instance = null;

const NETWORK_MODEL_NAME = "Network";

// TODO: On thread startup deactivate all existing networks with this
// controller node hostname?

// Singleton
export default class NetworkController extends PhantomCore {
  /**
   * @return {NetworkController}
   */
  static getInstance() {
    if (!_instance) {
      throw new Error(`NetworkController instance isn't available`);
    } else {
      return _instance;
    }
  }

  constructor() {
    if (_instance) {
      return _instance;
    }

    super({ isAsync: true });

    _instance = this;

    // TODO: Use as config option
    this.setMaxListeners(1000);

    this._db = null;
    this._networkSchema = null;

    this._init();
  }

  /**
   * IMPORTANT: Most usages of this should not shut this down directly.
   * 
   * TODO: Refactor accordingly.
   * 
   * @return {Promise<void>}
   */
  async destroy() {
    if (this._db) {
      this._db.connection.close();

      this._db = null;
    }
  }

  /**
   * @return {Promise<void>}
   */
  async _init() {
    // TODO: Replace hardcoded password
    this._db = await mongoose.connect(
      `mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_APP_DB_NAME}`,
      {
        auth: {
          authSource: "admin",
        },
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    );

    // TODO: Implement length validation for any client-generated strings (i.e. realmId, channelId, description, virtualServer*)
    this._networkSchema = new mongoose.Schema(
      {
        name: {
          type: String,
          required: true,
        },
        realmId: {
          type: String,
          required: true,
        },
        channelId: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        isPublic: {
          type: Boolean,
          required: true,
        },
        backgroundImage: {
          type: Object,
        },
        connectedParticipants: {
          type: Number,
          required: false,
        },
        maxParticipants: {
          type: Number,
          required: false,
        },
        controllerNodeHostname: {
          type: String,
          required: true,
        },
        virtualServerIsConnected: {
          type: Boolean,
          required: true,
          index: true,
        },
        virtualServerSocketId: {
          // TODO: Rename to virtualServer socket id
          type: String,
          required: true,
        },
        virtualServerDeviceAddress: {
          type: String,
          required: true,
        },
        virtualServerUserAgent: {
          type: String,
          required: true,
        },
        virtualServerCoreCount: {
          type: Number,
          required: false,
        },
        virtualServerBuildHash: {
          type: String,
          required: true,
        },
        // TODO: Rename to type, and use values "virtualServer" / "mesh"
        virtualServerType: {
          type: String,
          required: true,
          enum: [SERVER_TYPE_INTERNAL, SERVER_TYPE_EXTERNAL],
        },
        /*
        virtualServerLoginDates: {
          type: Date[] / string?,
          required: true
        },
        stunTurnConfig: { // Shared across the network
          type: String,
          required: true
        },
        passwordHash: {
          type: String,
          required: false
        }
        */
        maxConcurrentAudioStreams: {
          type: Number,
          required: false,
        },
        maxConcurrentVideoStreams: {
          type: Number,
          required: false,
        },
        maxVideoResolution: {
          type: String, // Object w/ defined properties?
          required: false,
        },
      },
      { timestamps: true }
    );

    // Ensure realm and channel are unique
    this._networkSchema.index({ realmId: 1, channelId: 1 }, { unique: true });

    // TODO: What is this used for?  Should it be used?
    // await this._networkSchema.syncIndexes();

    await super._init();
  }

  /**
   * @param {Object} networkParams TODO: Document
   * @return {Promise<Network>} TODO: Document
   */
  async createNetwork({
    name,
    realmId,
    channelId,
    description,
    virtualServerSocketId,
    virtualServerType,
    isPublic,
    backgroundImage = {},
    connectedParticipants = 0, // The number currently connected to the network, not the max
    maxParticipants = null,
    virtualServerDeviceAddress,
    virtualServerUserAgent,
    virtualServerBuildHash,
    virtualServerCoreCount,
    maxConcurrentAudioStreams = null,
    maxConcurrentVideoStreams = null,
    maxVideoResolution = null,
  }) {
    // TODO: Convert to class method
    const Network = mongoose.model(NETWORK_MODEL_NAME, this._networkSchema);

    const network = new Network({
      name,
      controllerNodeHostname: os.hostname(),
      realmId,
      channelId,
      description,
      isPublic,
      backgroundImage,
      connectedParticipants,
      maxParticipants,
      virtualServerIsConnected: Boolean(virtualServerSocketId),
      virtualServerSocketId,
      virtualServerType,
      virtualServerDeviceAddress,
      virtualServerUserAgent,
      virtualServerBuildHash,
      virtualServerCoreCount,
      maxConcurrentAudioStreams,
      maxConcurrentVideoStreams,
      maxVideoResolution,
    });

    await network.save();

    this.emit(EVT_NETWORK_CREATED, network);

    return network;
  }

  /**
   * @param {Object} network
   * @param {number} connectedParticipants
   * @return {Promise<void>}
   */
  async setParticipantCount(network, connectedParticipants) {
    network.connectedParticipants = connectedParticipants;

    await network.save();

    this.emit(EVT_NETWORK_UPDATED, network);
  }

  /**
   * @param {Object} network
   * @param {Object | string} backgroundImage
   */
  async setBackgroundImage(network, backgroundImage) {
    try {
      network.backgroundImage = backgroundImage;

      await network.save();

      this.emit(EVT_NETWORK_UPDATED, network);
    } catch (err) {
      console.warn("Caught", err);
    }
  }

  /**
   * Deactivates all networks for this host.
   *
   * IMPORTANT: This should only be utilized during startup and shutdown.
   *
   * @return {Promise<void>}
   */
  async deactivateHostNetworks() {
    const networks = await this.fetchNetworks({
      controllerNodeHostname: os.hostname(),
    });

    await Promise.all(networks.map(network => this.deactivateNetwork(network)));
  }

  async deactivateNetwork(network) {
    /*
    // TODO: Update verbiage
    console.log("Handling network socket deregister");

    await network.updateOne({
      controllerNodeHostname: null,
      virtualServerIsConnected: false,
      virtualServerSocketId: null,
      connectedParticipants: null,
    });

    await network.save();
    */

    // TODO: Keep it like this?
    await network.delete();

    this.emit(EVT_NETWORK_DESTROYED, network);

    // TODO: Update verbiage
    console.log("Successfully deregistered network");
  }

  // TODO: Document
  // TODO: Only fetch networks available to the given client
  async fetchNetworks(
    query = { isPublic: true, virtualServerIsConnected: true }
  ) {
    try {
      // TODO: Convert to class method
      const Network = mongoose.model(NETWORK_MODEL_NAME, this._networkSchema);

      // TODO: Exclude private fields (unless specified in options)
      const networks = await Network.find(query);

      // TODO: Return plain object (unless specified in options)
      return networks;
    } catch (err) {
      // Fix race condition where this method might be called before the schema
      // is registered
      //
      // TODO: Don't use this method before ready
      if (err.message.includes("Schema hasn't been registered")) {
        await sleep(1000);

        // Try again after sleep
        return this.fetchNetworks(query);
      } else {
        throw err;
      }
    }
  }

  /**
   * NOTE: This method is intentionally privatized.
   *
   * Public API calls should currently use fetchNetworks()
   *
   * TODO: Add query interface to this and to fetchNetworks and use the same
   * interface, then make this a public method again.
   *
   * @typedef {Object} NetworkDBObjectQuery
   * @property {string} realmId
   * @property {string} channelId
   *
   * @param {NetworkDBObjectQuery}
   * @return {Promise<NetworkDBObject>}
   */
  async _fetchNetwork({ realmId, channelId, ...rest }) {
    // TODO: Convert to class method
    const Network = mongoose.model(NETWORK_MODEL_NAME, this._networkSchema);

    const network = await Network.findOne({ realmId, channelId, ...rest });

    return network;
  }

  /**
   * @return {Promise<string>}
   */
  async fetchVirtualServerSocketId({ realmId, channelId }) {
    const network = await this._fetchNetwork({ realmId, channelId });

    if (network) {
      return network["virtualServerSocketId"];
    } else {
      console.warn(
        `Unable to find network with realm "${realmId}" and channel "${channelId}"`
      );
    }
  }
}
