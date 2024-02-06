import s from './index.module.scss';
import React from 'react';
import spritePath from '@/sprite.svg';

export const Icon = React.forwardRef(
  (
    {
      iconId,
      iconClass,
      iconWidth = 24,
      iconHeight = 24,
      onClick,
      color,
      clickable,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={`${s.icon} ${iconClass}`}
        onClick={onClick}
        style={{
          ...(disabled && { cursor: 'default' }),
          ...(clickable && { cursor: 'pointer' }),
          ...(disabled && { pointerEvents: 'none' }),
          ...style,
        }}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <svg
          className=""
          width={iconWidth}
          height={iconHeight}
          color={disabled ? '#BDBDBD' : color}
        >
          <use xlinkHref={`${spritePath}#${iconId}`} />
        </svg>
      </div>
    );
  }
);
