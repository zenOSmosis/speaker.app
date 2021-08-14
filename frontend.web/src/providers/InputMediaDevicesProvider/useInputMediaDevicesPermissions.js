import { useState } from "react";

/**
 * Manages state of user permissions for media input devices.
 *
 * NOTE: This does not directly prompt the user to accept / reject permissions,
 * it's just a dumb state container.
 *
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 */
export default function useInputMediaDevicesPermissions() {
  const [hasUserAudioPermission, setHasUserAudioPermission] = useState(false);
  const [hasUserVideoPermission, setHasUserVideoPermission] = useState(false);

  return {
    hasUserAudioPermission,
    setHasUserAudioPermission,

    hasUserVideoPermission,
    setHasUserVideoPermission,
  };
}
