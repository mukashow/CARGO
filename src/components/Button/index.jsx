import s from './button.module.scss';
import clsx from 'clsx';
import { Icon } from '@components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const Button = ErrorBoundaryHoc(
  ({
    value,
    isOrange,
    isBlue,
    isSmall,
    lightBlue,
    red,
    green,
    className = '',
    iconLeftId,
    isStaticTitle = false,
    textButton,
    type,
    iconColor,
    black,
    tiny,
    iconWidth,
    iconHeight,
    children,
    textStyle,
    ...props
  }) => {
    if (type === 'button') {
      return (
        <button
          className={clsx(
            isSmall && s.isSmall,
            isOrange && s.isOrange,
            isBlue && s.isBlue,
            lightBlue && s.lightBlue,
            green && s.green,
            isStaticTitle ? s.staticTitle : s.isDefault,
            textButton && s.textButton,
            red && s.red,
            black && s.black,
            tiny && s.tiny,
            className,
            props.disabled && s.disabled
          )}
          {...props}
        >
          {iconLeftId && (
            <Icon
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              iconId={iconLeftId}
              iconClass={s.iconLeft}
              color={iconColor}
            />
          )}
          <p style={textStyle}>
            <span>{value}</span> <span>{children}</span>
          </p>
        </button>
      );
    }

    return (
      <div
        className={clsx(
          isSmall && s.isSmall,
          isOrange && s.isOrange,
          isBlue && s.isBlue,
          lightBlue && s.lightBlue,
          green && s.green,
          isStaticTitle ? s.staticTitle : s.isDefault,
          textButton && s.textButton,
          red && s.red,
          black && s.black,
          tiny && s.tiny,
          className,
          props.disabled && s.disabled
        )}
        {...props}
      >
        {iconLeftId && (
          <Icon
            iconHeight={iconHeight}
            iconWidth={iconWidth}
            iconId={iconLeftId}
            iconClass={s.iconLeft}
            color={iconColor}
          />
        )}
        <p style={textStyle}>
          <span>{value}</span> <span>{children}</span>
        </p>
      </div>
    );
  }
);
