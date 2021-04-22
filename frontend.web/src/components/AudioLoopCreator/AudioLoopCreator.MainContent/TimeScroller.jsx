import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import useViewportSize from "@hooks/useViewportSize";

export default forwardRef(function TimeScroller(
  { refButtonTableContainer },
  ref
) {
  const [percentage, _setPercentage] = useState(null);

  const [lastViewportSizeUpdateTime, setLastViewportSizeUpdateTime] = useState(
    0
  );

  useViewportSize(() => setLastViewportSizeUpdateTime(new Date().getTime()));

  const verticalBarPositionLeft = useMemo(() => {
    const buttonTableContainer =
      refButtonTableContainer && refButtonTableContainer.current;

    // Note: lastViewportSizeUpdateTime is just here to consume the dependency
    // so that this updates each time it changes
    if (buttonTableContainer && lastViewportSizeUpdateTime !== undefined) {
      const left =
        buttonTableContainer.scrollWidth * (percentage / 100) -
        buttonTableContainer.scrollLeft;

      return left;
    }
  }, [lastViewportSizeUpdateTime, percentage, refButtonTableContainer]);

  useImperativeHandle(
    ref,
    () => ({
      setPercentage: (percentage) => {
        _setPercentage(percentage);
      },
    }),
    []
  );

  return (
    <div
      style={{
        width: 2,
        height: "100%",
        position: "absolute",
        top: 0,
        left: verticalBarPositionLeft,
        backgroundColor: "orange",

        // Prevent showing horizontal scrollbar when 100% complete
        display: percentage === 100 ? "none" : "block",
      }}
    ></div>
  );
});
