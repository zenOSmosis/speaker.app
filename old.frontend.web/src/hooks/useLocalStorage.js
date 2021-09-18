import { useCallback, useMemo, useEffect } from "react";
import useForceUpdate from "./useForceUpdate";
import SecureLS from "secure-ls";

/**
 * Local storage wrapper with an in-memory polyfill if localStorage isn't
 * available.
 */
export default function useLocalStorage() {
  const forceUpdate = useForceUpdate();

  /**
   * AES encryption and data compression
   *
   * @see https://varunmalhotra.xyz/secure-ls/#live-demo
   */
  const sls = useMemo(() => {
    const _createSLS = () =>
      // TODO: Implement encrypted namespaces (https://github.com/softvar/secure-ls/issues/44)
      // i.e. new SecureLS({ encryptionNamespace: "private", encryptionSecret: "secret1" });
      //
      // TODO: The aes algorithm seems to lock up when setting large local
      // storage state Firefox; consider a different implementation
      new SecureLS({
        encodingType: "aes",
        isCompression: true,
      });

    try {
      return _createSLS();
    } catch (err) {
      console.warn("Clearing secured local storage and starting over");

      // Clear existing local storage and start over
      window.localStorage.clear();

      return _createSLS();
    }
  }, []);

  // TODO: Enable implementing of any type value?
  /**
   * @param {string} key
   * @param {string} value
   * @param {boolean} withForceUpdate? [optional; default = true] If set to
   * true, performs a force update after the item is set
   * @return {void}
   */
  const setItem = useCallback(
    (key, value, withForceUpdate = true) => {
      sls.set(key, value);

      if (withForceUpdate) {
        forceUpdate();
      }
    },
    [sls, forceUpdate]
  );

  // TODO: Enable retrieval of any type value?
  /**
   * @param {string}
   * @return {any}
   */
  const getItem = useCallback(
    key => {
      try {
        return sls.get(key);
      } catch (err) {
        console.warn("Caught", err);
      }
    },
    [sls]
  );

  const removeItem = useCallback(
    key => {
      sls.remove(key);

      // Update local UI
      forceUpdate();
    },
    [sls, forceUpdate]
  );

  /**
   * Empties all of the local storage
   */
  const clear = useCallback(() => {
    sls.removeAll();

    // Update local UI
    forceUpdate();
  }, [sls, forceUpdate]);

  /**
   * Force the UI to update when local storage has been modified.
   *
   * Note: All connected browser windows / tabs will be affected by this.
   *
   * This probably won't execute on the local window (force update is utilized
   * when setting local storage locally).
   *
   * For browser support:
   * @see https://caniuse.com/mdn-api_storageevent (iOS 14.4+ / Safari 14+)
   */
  useEffect(() => {
    const _handleLocalStorageEvent = () => {
      forceUpdate();
    };

    window.addEventListener("storage", _handleLocalStorageEvent);

    return function unmount() {
      window.removeEventListener("storage", _handleLocalStorageEvent);
    };
  }, [forceUpdate]);

  return {
    setItem,
    getItem,
    removeItem,
    clear,
  };
}
