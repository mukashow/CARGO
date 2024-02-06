import React from 'react';
import s from './index.module.scss';
import clsx from 'clsx';
import { DebounceInput } from 'react-debounce-input';
import { Controller } from 'react-hook-form';
import { Icon } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const Debounce = ErrorBoundaryHoc(
  ({
    placeholder,
    control,
    name,
    labelText,
    labelSmall,
    small,
    inputDisabled,
    minLength = 1,
    debounceTimeout = 300,
    floatLabel,
    onChange = () => {},
    errors,
    iconId,
    iconClick,
    thin = false,
    thinLabel,
    ...props
  }) => {
    return (
      <div>
        <label className={clsx(s.label, floatLabel && s.float)} disabled={inputDisabled}>
          {labelText && (
            <div
              className={clsx(
                s.labelText,
                floatLabel && s.float,
                thinLabel && s.thin,
                labelSmall && s.small
              )}
            >
              {labelText}
            </div>
          )}
          <div className={s.wrapperInput}>
            {control ? (
              <Controller
                name={name}
                control={control}
                render={({ field }) => {
                  return (
                    <DebounceInput
                      minLength={minLength}
                      debounceTimeout={debounceTimeout}
                      className={clsx(s.input, thin && s.thin)}
                      placeholder={placeholder}
                      disabled={inputDisabled}
                      {...field}
                      onChange={e => {
                        onChange(e);
                        field.onChange(e);
                      }}
                      {...props}
                    />
                  );
                }}
              />
            ) : (
              <DebounceInput
                minLength={minLength}
                debounceTimeout={debounceTimeout}
                className={clsx(s.input, thin && s.thin, small && s.small)}
                placeholder={placeholder}
                disabled={inputDisabled}
                onChange={onChange}
                {...props}
              />
            )}
            {iconId && (
              <Icon onClick={iconClick} iconId={iconId} iconClass={`${s.icon} ${s.iconRed}`} />
            )}
          </div>
        </label>
        {errors && errors[name] && <span className={s.error}>{errors[name].message}</span>}
      </div>
    );
  }
);
