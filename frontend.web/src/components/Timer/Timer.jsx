import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import getSecondsToHHMMSS from "@shared/time/getSecondsToHHMMSS";

Timer.propTypes = {
  onTick: PropTypes.func.isRequired,
};

export default function Timer({ onTick, ...rest }) {
  const [seconds, _setSeconds] = useState(onTick());

  const getSeconds = useCallback(() => {
    const seconds = onTick();

    return seconds;
  }, [onTick]);

  useEffect(() => {
    const handleUpdate = () => _setSeconds(getSeconds());

    // Perform initial render
    handleUpdate();

    const updateInterval = setInterval(handleUpdate, 1000);

    return function unmount() {
      clearInterval(updateInterval);
    };
  }, [getSeconds]);

  return <span {...rest}>{getSecondsToHHMMSS(seconds)}</span>;
}
