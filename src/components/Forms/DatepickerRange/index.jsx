import s from '../Input/index.module.scss';
import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller } from 'react-hook-form';
import clsx from 'clsx';
import ru from 'date-fns/locale/ru';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Icon } from '@/components';

export const DatePickerRange = ErrorBoundaryHoc(
  ({
    labelText,
    floatLabel,
    name,
    control,
    placeholder,
    errors,
    thin,
    style,
    onChange = () => {},
    value,
    iconColor,
    noBorder,
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
                render={({ field: { value, ...rest } }) => {
                  return (
                    <ReactDatePicker
                      className={clsx(s.input, thin && s.thin, noBorder && s.noBorder)}
                      dropdownMode="select"
                      defaultValue
                      locale="ru"
                      selectsRange
                      placeholderText={placeholder}
                      startDate={value[0]}
                      endDate={value[1]}
                      onChange={e => {
                        onChange(e);
                        rest.onChange(e);
                      }}
                      dateFormat="dd.MM.yy"
                      showYearDropdown
                      showMonthDropdown
                    />
                  );
                }}
              />
            ) : (
              <ReactDatePicker
                className={clsx(s.input, thin && s.thin, noBorder && s.noBorder)}
                locale="ru"
                selectsRange
                placeholderText={placeholder}
                startDate={value[0]}
                endDate={value[1]}
                onChange={onChange}
                dateFormat="dd.MM.yy"
                showYearDropdown
                showMonthDropdown
              />
            )}
            <Icon
              iconClass={clsx(s.icon, thin && s.thin)}
              color={noBorder ? '#0B6BE6' : iconColor}
              iconId="calendar"
              clickable
              iconWidth={noBorder ? 22 : 20}
              iconHeight={noBorder ? 22 : 20}
            />
          </div>
        </label>
        {errors && <span className={s.error}>{errors}</span>}
      </div>
    );
  }
);
