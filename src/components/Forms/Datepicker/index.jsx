import s from '../Input/index.module.scss';
import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller } from 'react-hook-form';
import clsx from 'clsx';
import ru from 'date-fns/locale/ru';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon } from '@/components';

export const DatePicker = ErrorBoundaryHoc(
  ({
    labelText,
    iconColor,
    name,
    control,
    placeholder,
    errors,
    floatLabel,
    thin,
    style,
    ...props
  }) => {
    registerLocale('ru', ru);

    return (
      <div style={style}>
        <label className={clsx(s.label, floatLabel && s.float)}>
          {labelText && <div className={clsx(s.labelText, floatLabel && s.float)}>{labelText}</div>}
          <div className={s.wrapperInput}>
            {control ? (
              <Controller
                name={name}
                control={control}
                render={({ field }) => {
                  return (
                    <ReactDatePicker
                      className={clsx(s.input, thin && s.thin)}
                      locale="ru"
                      placeholderText={placeholder}
                      onChange={field.onChange}
                      selected={field.value}
                      dateFormat="dd.MM.yyyy"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                    />
                  );
                }}
              />
            ) : (
              <ReactDatePicker
                className={clsx(s.input, thin && s.thin)}
                locale="ru"
                placeholderText={placeholder}
                dateFormat="dd.MM.yyyy"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                name={name}
                {...props}
              />
            )}
            <Icon
              iconClass={s.icon}
              color={iconColor}
              iconId="calendar"
              iconHeight={24}
              iconWidth={24}
            />
          </div>
        </label>
        {errors && <span className={s.error}>{errors}</span>}
      </div>
    );
  }
);
