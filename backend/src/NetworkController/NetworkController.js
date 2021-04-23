import os from "os";
import PhantomBase, { EVT_READY } from "phantom-base";
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
export default class NetworkController extends PhantomBase {
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

    super({ isReady: false });

    _instance = this;

    // TODO: Use as config option
    this.setMaxListeners(1000);

    this._db = null;
    this._networkSchema = null;

    this._init();
  }

  /**
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

    // TODO: Implement length validation for any client-generated strings (i.e. realmId, channelId, description, transcoder*)
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
        transcoderIsConnected: {
          type: Boolean,
          required: true,
          index: true,
        },
        transcoderSocketId: {
          // TODO: Rename to transcoder socket id
          type: String,
          required: true,
        },
        transcoderDeviceAddress: {
          type: String,
          required: true,
        },
        transcoderUserAgent: {
          type: String,
          required: true,
        },
        transcoderCoreCount: {
          type: Number,
          required: false,
        },
        transcoderBuildHash: {
          type: String,
          required: true,
        },
        // TODO: Rename to type, and use values "transcoder" / "mesh"
        transcoderType: {
          type: String,
          required: true,
          enum: [SERVER_TYPE_INTERNAL, SERVER_TYPE_EXTERNAL],
        },
        /*
        transcoderLoginDates: {
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

    this.emit(EVT_READY);
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
    transcoderSocketId,
    transcoderType,
    isPublic,
    backgroundImage = {},
    connectedParticipants = 0, // The number currently connected to the network, not the max
    maxParticipants = null,
    transcoderDeviceAddress,
    transcoderUserAgent,
    transcoderBuildHash,
    transcoderCoreCount,
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
      transcoderIsConnected: Boolean(transcoderSocketId),
      transcoderSocketId,
      transcoderType,
      transcoderDeviceAddress,
      transcoderUserAgent,
      transcoderBuildHash,
      transcoderCoreCount,
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
  async setConnectedParticipants(network, connectedParticipants) {
    network.connectedParticipants = connectedParticipants;

    await network.save();

    this.emit(EVT_NETWORK_UPDATED, network);
  }

  /**
   * @param {Object} network
   * @param {Object} backgroundImage
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
      transcoderIsConnected: false,
      transcoderSocketId: null,
      connectedParticipants: null,
    });

    await network.save();
    */

    // TODO: Keep it like this?
    await network.delete();

    this.emit(EVT_NETWORK_DESTROYED, network);

    // TODO: Update verbiage
    console.log("Successfully deregister-ed network");
  }

  // TODO: Document
  // TODO: Only fetch networks available to the given client
  async fetchNetworks(query = { isPublic: true, transcoderIsConnected: true }) {
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
  async fetchTranscoderSocketId({ realmId, channelId }) {
    const network = await this._fetchNetwork({ realmId, channelId });

    if (network) {
      return network["transcoderSocketId"];
    } else {
      console.warn(
        `Unable to find network with realm "${realmId}" and channel "${channelId}"`
      );
    }
  }
}
