import s from './index.module.scss';
import React from 'react';
import { NumericFormat } from 'react-number-format';
import clsx from 'clsx';
import { ErrorBoundaryHocWithRef } from '@components/ErrorBoundary';
import { Icon } from '@/components';

export const Input = ErrorBoundaryHocWithRef(
  React.forwardRef(
    (
      {
        thinLabel,
        small,
        name = '',
        labelText,
        inputDisabled,
        register,
        errors,
        iconId,
        iconClick,
        containerClassName,
        thin = false,
        multiline,
        hidden,
        multiLineAsInput,
        style,
        containerStyle,
        onChange,
        lined,
        labelSmall,
        iconColor = '#DF3B57',
        className,
        passRef,
        endText,
        endTextToStart,
        formatInput,
        formatInputProps,
        ...rest
      },
      ref
    ) => {
      let regData = {};
      let formatInputRegData = {};
      if (register) {
        const { ref, ...rest } = register(name);
        regData = { ...rest, ref };
        formatInputRegData = { ...rest, getInputRef: ref };
      }

      return (
        <label className={clsx(s.label, containerClassName)} style={containerStyle}>
          {labelText && (
            <div className={clsx(s.labelText, thinLabel && s.thin, labelSmall && s.small)}>
              {labelText}
            </div>
          )}
          <div className={s.wrapperInput}>
            {multiline ? (
              <textarea
                {...regData}
                onChange={e => {
                  if (register) register(name).onChange(e);
                  if (onChange) onChange(e);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight + 2}px`;
                }}
                {...rest}
                className={clsx(s.input, s.textarea, multiLineAsInput && s.multiLine)}
                style={style}
                ref={e => {
                  if (regData.ref) {
                    regData.ref(e);
                    if (passRef) passRef.current = e;
                  }
                }}
              />
            ) : formatInput ? (
              <NumericFormat
                getInputRef={ref}
                {...(register && { ...formatInputRegData })}
                className={clsx(
                  s.input,
                  thin && s.thin,
                  small && s.small,
                  lined && s.lined,
                  className
                )}
                disabled={inputDisabled}
                hidden={hidden}
                style={style}
                onChange={e => {
                  if (register) register(name).onChange(e);
                  if (onChange) onChange(e);
                }}
                thousandSeparator=" "
                decimalSeparator=","
                {...formatInputProps}
                {...rest}
              />
            ) : (
              <input
                ref={ref}
                {...(register && { ...register(name) })}
                className={clsx(
                  s.input,
                  thin && s.thin,
                  small && s.small,
                  lined && s.lined,
                  className
                )}
                disabled={inputDisabled}
                hidden={hidden}
                style={style}
                onChange={e => {
                  if (register) register(name).onChange(e);
                  if (onChange) onChange(e);
                }}
                {...rest}
              />
            )}
            <p className={clsx(s.endText, endTextToStart && s.endTextToStart)}>{endText}</p>
            {iconId && (
              <Icon
                onClick={iconClick}
                iconId={iconId}
                iconClass={s.icon}
                color={iconColor}
                clickable
              />
            )}
          </div>
          {errors && <p className={s.error}>{errors}</p>}
        </label>
      );
    }
  )
);
