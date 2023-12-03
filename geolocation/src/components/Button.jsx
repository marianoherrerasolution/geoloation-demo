import React, { useState } from 'react';
import colors from '../config/colors';

export default function Button({ text, onClick }) {
  const [hover, setHover] = useState(false);
  const [click, setClick] = useState(false);

  const buttonClick = click ? colors.white : colors.danger;
  const textClick = click ? colors.primary : colors.white;

  const handleClick = () => {
    setClick(true);
    setTimeout(() => setClick(false), 200);
    onClick();
  };

  return (
    <div
      style={{
        ...styles.container,
        ...{
          backgroundColor: hover ? buttonClick : colors.secondary,
          color: hover ? textClick : colors.danger,
        },
      }}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleClick()}
    >
      {text}
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    fontSize: 16,
    fontWeight: 600,
    color: colors.danger,
    cursor: 'pointer',
  },
};
