import React from 'react';
import './style.css';

/**
 * Dynamically generated ReactComponent.
 */ 
const DynamicIcon = ({ className, ...propsRest }) => {
  return (
    <i
      {...propsRest}
      className={`ie6fddbbe9c56491a9c3dc7715461a9f6-icon${className ? ` ${className}` : ''}`}
    />
  );
};

export default DynamicIcon;
