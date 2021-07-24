import PhantomCore, { EVT_DESTROYED } from "phantom-core";

const _instances = {};

/**
 * A channeled event-stream-like wrapper for sending / receiving queries to the
 * Phantom Server / other peers.
 *
 * TODO: Document how client -> server works here (each end can be a server,
 * but only one end can be a server at a time, per instance).
 */
export default class PhantomEventChannel extends PhantomCore {
  // TODO: Document
  //
  // Performs sending of query to remote peer(s)
  /*
  static query(query) {
    throw new Error("TODO: This must be overridden");
  }
  */

  /**
   * Handles response which is routed to the relevant event channel.
   *
   * @param {Object} response // TODO: Document
   */
  /*
  static receiveResponse(response) {
    const { channel } = response;

    const eventChannel = _instances[channel];

    if (eventChannel) {
      eventChannel.receiveResponse(response);
    }
  }
  */

  // TODO: Document
  //
  // Sets up receiving side of event channel
  static async receiveQuery(query) {
    // TODO: Refactor this mapping
    const { d: destination, c: channel } = query;

    const eventChannel = await (async () => {
      let _retryAttempt = -1;

      // Allow grace period for all ends of channel to become established
      const _fetchEventChannel = async () => {
        ++_retryAttempt;

        const eventChannel = _instances[`${destination}-${channel}`];

        // TODO: Remove
        console.log({
          eventChannel,
          str: `${destination}-${channel}`,
          _instances,
        });

        if (eventChannel) {
          return eventChannel;
        } else {
          // TODO: Make configurable
          if (_retryAttempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // TODO: Make configurable

            return _fetchEventChannel();
          } else {
            throw new Error("Out of retries");
          }
        }
      };

      try {
        const eventChannel = await _fetchEventChannel();

        return eventChannel;
      } catch (err) {
        console.warn("Caught", err);
      }
    })();

    eventChannel.receiveQuery(query);
  }

  // TODO: Document
  //
  //  - destination: Used for routing
  //  - channel: Used for routing (does not correspond to realm / channel id
  // used for session establishment)
  constructor({
    destination,
    channel,

    // ChannelClass,

    // TODO: Override Sample implementation
    onQuery = query =>
      console.warn("TODO: Implement onQuery for query:", {
        query,
      }),
  }) {
    super();

    this._destination = destination;
    this._channel = channel;

    // Index of currently active query
    this._idx = -1;

    // Queries currently in progress (no response received, if receiving)
    this._runningQueries = [];

    this._handleQuerySend = onQuery;

    // TODO: Document; used for static function mapping
    // this._ChannelClass = ChannelClass;

    // Handle registration / unregistration
    (() => {
      _instances[`${destination}-${channel}`] = this;
      this.once(EVT_DESTROYED, () => {
        delete _instances[`${destination}-${channel}`];
      });
    })();
  }

  // TODO: Make this similar to Socket.io
  async query(eventName, eventData, ack = null) {
    const query = this._makeQuery(eventName, eventData);

    // TODO: Remove
    console.log({
      query,
    });

    if (typeof ack === "function") {
      this._runningQueries.push(query);
    }

    // TODO: If ack is not null, return ack(data)
    this._handleQuerySend(query);
  }

  /**
   * @param {String} eventName
   * @param {Object | any} eventData
   * @param {function} ack? [default=null]
   * @return {Object} // TODO: Remove
   */
  _makeQuery(eventName, eventData, ack = null) {
    ++this._idx;

    // TODO: Typedef this
    const query = {
      ev: eventName,
      da: eventData,
      d: this._destination,
      c: this._channel,
      idx: this._idx,
    };

    return query;
  }

  receiveQuery(query) {
    // TODO: Handle this
    console.warn("TODO: Handle receive query", {
      query,
      instance: this,
    });
  }

  /*
  receiveResponse(response) {
    // TODO: Pair this response id w/ the query id and emit it to ack handler
  }
  */
}
