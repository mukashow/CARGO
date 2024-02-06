import s from './index.module.scss';
import clsx from 'clsx';
import { Icon } from '@components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const Select = ErrorBoundaryHoc(
  ({
    register,
    errors,
    name,
    labelText,
    selectDisabled,
    placeholder,
    options,
    defaultValue = -1,
    thin = false,
    ...rest
  }) => {
    return (
      <label className={s.label}>
        {labelText && <div className={s.labelText}>{labelText}</div>}
        <div className={s.wrapperSelect}>
          <select
            {...(register && { ...register(name) })}
            className={clsx(s.select, selectDisabled && s.selectDisabled, thin && s.thin)}
            defaultValue={defaultValue}
            disabled={selectDisabled}
            {...rest}
          >
            {defaultValue === -1 && (
              <option value={defaultValue} disabled>
                {placeholder}
              </option>
            )}
            {options?.map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <Icon iconClass={s.icon} iconId="select" iconWidth={10} iconHeight={10} />
        </div>
        {errors && <span className={s.error}>{errors}</span>}
      </label>
    );
  }
);
