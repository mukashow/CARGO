import s from './index.module.scss';
import React from 'react';
import clsx from 'clsx';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon } from '@/components';

export const Checkbox = ErrorBoundaryHoc(
  ({
    checked,
    register,
    name,
    onChange = () => {},
    containerStyle,
    label,
    thin,
    size = 'default',
    variant = 'default',
    labelStyle,
    ...props
  }) => {
    return (
      <div className={clsx(s.root, thin && s.thin)} style={containerStyle}>
        <label
          className={clsx(s.checkbox, s[size])}
          {...(checked && variant === 'fill' && { style: { background: '#009E61' } })}
        >
          {register ? (
            <input
              type="checkbox"
              {...register(name)}
              onChange={e => {
                onChange(e);
                register(name).onChange(e);
              }}
              {...props}
            />
          ) : (
            <input type="checkbox" checked={checked} onChange={onChange} />
          )}
          <Icon
            iconId="access"
            color={checked && variant === 'fill' ? 'white' : '#009E61'}
            iconClass={clsx(s.flag, s[size])}
          />
        </label>
        {label && (
          <span className={s.label} style={labelStyle}>
            {label}
          </span>
        )}
      </div>
    );
  }
);
