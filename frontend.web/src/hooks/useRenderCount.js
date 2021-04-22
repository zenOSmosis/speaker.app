import { useRef, useCallback } from "react";

/**
 * Retrieves the number of times this component has been rendered.
 *
 * @return {number} Initial render is 0.
 */
export default function useRenderCount() {
  const refRenderCount = useRef(-1);

  ++refRenderCount.current;

  return useCallback(() => refRenderCount.current, []);
}
