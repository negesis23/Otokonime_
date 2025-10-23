
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = '' }) => {
  return (
    <span className={`material-symbols-rounded ${className}`}>
      {name}
    </span>
  );
};

export default Icon;
