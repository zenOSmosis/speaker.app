import os from "os";
import PhantomCore, { EVT_READY, sleep } from "phantom-core";
import mongoose from "mongoose";

const {
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_APP_DB_NAME,
  MONGO_APP_USERNAME,
  MONGO_APP_PASSWORD,
} = process.env;

export { EVT_READY };

export const EVT_NETWORK_CREATED = "network-created";
export const EVT_NETWORK_UPDATED = "network-updated";
export const EVT_NETWORK_DESTROYED = "network-destroyed";

let _instance = null;

const NETWORK_MODEL_NAME = "Network";

/**
 * IMPORTANT: This should be treated as a singleton.
 *
 * TODO: Utilize singleton option if it ever becomes available in PhantomCore:
 * @link https://github.com/zenOSmosis/phantom-core/issues/72
 *
 * NOTE: Networks themselves are not PhantomCore instances because multiple
 * instances of this class may span threads / CPUs and orchestrating that would
 * be a major challenge:
 * @link https://github.com/zenOSmosis/speaker.app/issues/101
 */
export default class NetworkController extends PhantomCore {
  /**
   * Retrieves the singleton instance of the NetworkController.
   *
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
    this._mongooseNetworkSchema = null;

    this._init();
  }

  /**
   * @return {Promise<void>}
   */
  async _init() {
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

    // TODO: Implement input / length validation for any client-generated
    // strings (i.e. realmId, channelId, description, virtualServer)
    this._mongooseNetworkSchema = new mongoose.Schema(
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
    this._mongooseNetworkSchema.index(
      { realmId: 1, channelId: 1 },
      { unique: true }
    );

    // TODO: What is this used for?  Should it be used?
    // await this._mongooseNetworkSchema.syncIndexes();

    await super._init();
  }

  /**
   * IMPORTANT: Most usages of this should not shut this down directly.
   *
   * @return {Promise<void>}
   */
  async destroy() {
    this.log.warn(
      `${this.getClassName()} is a singleton and cannot be shut down directly`
    );

    /*
    if (this._db) {
      // NOTE: (jh) I'm not sure if this is a promise type but it doesn't need
      // to be awaited for because we're not going to use it again.
      this._db.connection.close();

      this._db = null;
    }

    return super.destroy();
    */
  }

  /**
   * @param {Object} networkParams TODO: Document structure
   * @return {Promise<mongoose.Model>}
   */
  async createNetwork({
    name,
    realmId,
    channelId,
    description,
    virtualServerSocketId,
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
    const MongooseNetwork = mongoose.model(
      NETWORK_MODEL_NAME,
      this._mongooseNetworkSchema
    );

    const mongooseNetwork = new MongooseNetwork({
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
      virtualServerDeviceAddress,
      virtualServerUserAgent,
      virtualServerBuildHash,
      virtualServerCoreCount,
      maxConcurrentAudioStreams,
      maxConcurrentVideoStreams,
      maxVideoResolution,
    });

    await mongooseNetwork.save();

    this.emit(EVT_NETWORK_CREATED, mongooseNetwork);

    return mongooseNetwork;
  }

  /**
   * @param {mongoose.Model} mongooseNetwork
   * @param {number} connectedParticipants
   * @return {Promise<void>}
   */
  async setParticipantCount(mongooseNetwork, connectedParticipants) {
    mongooseNetwork.connectedParticipants = connectedParticipants;

    await mongooseNetwork.save();

    this.emit(EVT_NETWORK_UPDATED, mongooseNetwork);
  }

  /**
   * @param {mongoose.Model} mongooseNetwork
   * @param {Object | string} backgroundImage
   * @return {Promise<void>}
   */
  async setBackgroundImage(mongooseNetwork, backgroundImage) {
    try {
      mongooseNetwork.backgroundImage = backgroundImage;

      await mongooseNetwork.save();

      this.emit(EVT_NETWORK_UPDATED, mongooseNetwork);
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
    const mongooseNetworks = await this.fetchNetworks({
      controllerNodeHostname: os.hostname(),
    });

    await Promise.all(
      mongooseNetworks.map(mongooseNetwork =>
        this.deactivateNetwork(mongooseNetwork)
      )
    );
  }

  /**
   * @param {mongoose.Model} mongooseNetwork
   * @return {Promise<void>}
   */
  async deactivateNetwork(mongooseNetwork) {
    // FIXME: (jh) There's two ways of possibly going about this, either
    // deleting the network entirely (which it currently does now) or adding a
    // flag that it is deregistered.  I think the best approach is to delete it
    // entirely in order to keep things as stateless as possible, but that also
    // means that someone else could potentially create the same network, unless
    // realmId is pinned to the device address.

    /*
    // Deregister network
    await network.updateOne({
      controllerNodeHostname: null,
      virtualServerIsConnected: false,
      virtualServerSocketId: null,
      connectedParticipants: null,
    });
    await network.save();
    //
    // .... or... (delete, like it is doing now)
    */

    await mongooseNetwork.delete();

    this.emit(EVT_NETWORK_DESTROYED, mongooseNetwork);

    console.log("Successfully deregistered network");
  }

  // TODO: Only fetch networks available to the given client
  /**
   * @param {Object} query // TODO: Define query structure
   * @return {mongoose.Model[]}
   */
  async fetchNetworks(
    query = { isPublic: true, virtualServerIsConnected: true }
  ) {
    try {
      // TODO: Convert to class method
      const MongooseNetwork = mongoose.model(
        NETWORK_MODEL_NAME,
        this._mongooseNetworkSchema
      );

      // TODO: Exclude private fields (unless specified in options)
      const mongooseNetwork = await MongooseNetwork.find(query);

      // TODO: Return plain object (unless specified in options)
      return mongooseNetwork;
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
   * @return {Promise<mongoose.Model | void>}
   */
  async _fetchNetwork({ realmId, channelId, ...rest }) {
    // TODO: Convert to class method
    const Network = mongoose.model(
      NETWORK_MODEL_NAME,
      this._mongooseNetworkSchema
    );

    const mongooseNetwork = await Network.findOne({
      realmId,
      channelId,
      ...rest,
    });

    return mongooseNetwork;
  }

  /**
   * Fetches the Socket ID of the virtual server which is hosting the network.
   *
   * This information is used to set up signaling communications via
   * ZenRTCSignalBroker so that clients can connect to the network.
   *
   * @param {NetworkDBObjectQuery}
   * @return {Promise<string | void>}
   */
  async fetchVirtualServerSocketId({ realmId, channelId }) {
    const mongooseNetwork = await this._fetchNetwork({ realmId, channelId });

    if (mongooseNetwork) {
      return mongooseNetwork["virtualServerSocketId"];
    } else {
      console.warn(
        `Unable to find network with realm "${realmId}" and channel "${channelId}"`
      );
    }
  }
}
