import React, { useCallback, useEffect, useMemo, useRef } from "react";

import getInitials from "@shared/string/getInitials";

import { KEY_LOCAL_PROFILE } from "@local/localStorageKeys";
import useLocalStorage from "@hooks/useLocalStorage";

import useRenderCount from "@hooks/useRenderCount";
import useDirtyState from "@hooks/useDirtyState";

import {
  generateAvatar,
  generateName,
  generateDescription,
} from "@local/profile";

export const LocalProfileContext = React.createContext({});

export default function LocalProfileProvider({ children }) {
  const {
    state = {},
    setState,
    setCleanState,
    isDirty,
    save,
    cancel,
  } = useDirtyState({
    avatarURL: null,
    name: null,
    description: null,
  });

  const { avatarURL = null, name = null, description = null } = state;

  const initials = useMemo(() => getInitials(name), [name]);

  const setAvatarURL = useCallback((avatarURL) => setState({ avatarURL }), [
    setState,
  ]);
  const setName = useCallback((name) => setState({ name }), [setState]);
  const setDescription = useCallback(
    (description) => setState({ description }),
    [setState]
  );

  const handleGenerateAvatar = useCallback(async () => {
    const avatarURL = await generateAvatar();

    setAvatarURL(avatarURL);
  }, [setAvatarURL]);

  const handleGenerateName = useCallback(async () => {
    const name = await generateName();

    setName(name);

    return name;
  }, [setName]);

  const handleGenerateDescription = useCallback(async () => {
    const description = await generateDescription();

    setDescription(description);

    return description;
  }, [setDescription]);

  const { getItem, setItem } = useLocalStorage();

  /**
   * Retrieves cache from local storage.
   *
   * @return {Object}
   */
  const getCachedData = useCallback(() => {
    const cachedData = getItem(KEY_LOCAL_PROFILE);

    return cachedData;
  }, [getItem]);

  /**
   * Sets cache to local storage
   */
  const setCachedData = useCallback(
    (data) => {
      setItem(KEY_LOCAL_PROFILE, data, false);
    },
    [setItem]
  );

  const refState = useRef(state);
  refState.current = state;
  useEffect(() => {
    if (!isDirty && refState.current.name) {
      setCachedData(refState.current);
    }
  }, [isDirty, setCachedData]);

  const getRenderCount = useRenderCount();

  useEffect(() => {
    const renderCount = getRenderCount();

    if (renderCount === 0) {
      const cachedData = getCachedData();

      if (!cachedData) {
        (async () => {
          const [avatarURL, name, description] = await Promise.all([
            generateAvatar(),
            generateName(),
            generateDescription(),
          ]);

          setCleanState({
            avatarURL,
            name,
            description,
          });
        })();
      } else {
        setCleanState(cachedData);
      }
    }
  }, [
    name,
    description,
    avatarURL,
    getRenderCount,
    handleGenerateAvatar,
    handleGenerateName,
    handleGenerateDescription,
    setCleanState,
    getCachedData,
  ]);

  return (
    <LocalProfileContext.Provider
      value={{
        avatarURL,
        setAvatarURL,
        generateAvatar: handleGenerateAvatar,
        name,
        setName,
        generateName: handleGenerateName,
        initials,
        description,
        generateDescription: handleGenerateDescription,
        setDescription,
        save,
        cancel,
        isDirty,
      }}
    >
      {children}
    </LocalProfileContext.Provider>
  );
}
