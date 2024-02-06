import s from './index.module.scss';
import React from 'react';
import { Controller } from 'react-hook-form';
import Select, { components } from 'react-select';
import AsyncSelect from 'react-select/async';
import clsx from 'clsx';
import { Checkbox, ErrorBoundaryHocWithRef, Icon } from '@components';

export const SelectCustom = ErrorBoundaryHocWithRef(
  React.forwardRef(
    (
      {
        thinLabel,
        floatLabel,
        small,
        labelText,
        async,
        error,
        errorBorder,
        blue,
        thin,
        isDisabled,
        style,
        control,
        name,
        lined,
        onChange = () => {},
        dropdownIndicatorColor,
        containerStyle,
        showCheckbox = false,
        withSubtitle = false,
        maxContentMenu = false,
        ...rest
      },
      ref
    ) => {
      const props = {
        className: clsx(
          s.select,
          thin && s.thin,
          isDisabled && s.disabled,
          errorBorder && s.errorBorder,
          lined && s.lined
        ),
        classNamePrefix: 'select',
        components: {
          DropdownIndicator: () =>
            lined ? null : (
              <Icon
                iconClass={s.selectDown}
                iconId="select"
                color={dropdownIndicatorColor}
                iconWidth={10}
                iconHeight={8}
              />
            ),
          IndicatorSeparator: ({ selectProps, isMulti }) =>
            isMulti && selectProps.value?.length > 1 ? (
              <span style={{ margin: '0 5px' }}>({selectProps.value?.length})</span>
            ) : null,
          ClearIndicator: rest => (rest.isMulti ? null : <components.ClearIndicator {...rest} />),
          Option: rest => {
            return showCheckbox ? (
              <components.Option {...rest}>
                <div className={s.checkboxOption}>
                  <Checkbox checked={rest.isSelected} onChange={() => null} />
                  <div>{rest.label}</div>
                </div>
              </components.Option>
            ) : withSubtitle ? (
              <components.Option {...rest} className={s.optionWithSubtitle}>
                <p>{rest.data.label}</p>
                <span className={clsx(rest.isSelected && s.active)}>{rest.children}</span>
              </components.Option>
            ) : (
              <components.Option {...rest}>{rest.children}</components.Option>
            );
          },
          SingleValue: rest => {
            return withSubtitle ? (
              <components.SingleValue {...rest}>
                <span style={{ color: '#0B6BE6' }}>{rest.data.label}</span>{' '}
                <span style={{ color: '#828282' }}>{rest.children}</span>
              </components.SingleValue>
            ) : (
              <components.SingleValue {...rest}>{rest.children}</components.SingleValue>
            );
          },
          MultiValue: ({ selectProps, data }) => {
            const index = selectProps.value?.findIndex(
              item => (item.value || item.id) === (data.value || data.id)
            );
            return (
              <div style={{ flexShrink: 0 }}>
                {index !== 0 && ', '}
                {data.label || data.name}
              </div>
            );
          },
        },
        styles: {
          container: provided => ({ ...provided, ...containerStyle }),
          control: provided => ({
            ...provided,
            height: '100%',
            boxShadow: 'none',
            border: 'none',
            borderRadius: lined ? 0 : 3,
            width: '100%',
            padding: small || thin ? '0 2px' : '0 6px',
            minHeight: 'auto',
            background: !floatLabel
              ? lined || (lined && isDisabled)
                ? 'transparent'
                : isDisabled
                ? '#E7E7E7'
                : provided.background
              : 'none',
          }),
          singleValue: provided => ({
            ...provided,
            color: isDisabled ? '#828282' : blue ? '#0B6BE6' : '#232323',
            ...(small && { fontSize: 12 }),
          }),
          placeholder: provided => ({
            ...provided,
            color: thin ? '#828282' : '#BDBDBD',
            ...(small && { fontSize: 12 }),
          }),
          multiValueRemove: provided => ({ ...provided, display: 'none' }),
          multiValue: provided => ({
            ...provided,
            background: 'none',
            margin: 0,
            flexShrink: 0,
          }),
          multiValueLabel: provided => ({
            ...provided,
            padding: 0,
            paddingLeft: 0,
            fontSize: 'inherit',
          }),
          valueContainer: provided => ({
            ...provided,
            flexDirection: 'row',
            flexWrap: 'none',
          }),
          menuPortal: provided => ({
            ...provided,
            zIndex: rest.menuPortalTarget ? 9999 : 'unset',
            fontSize: 12,
          }),
          menu: provided => ({
            ...provided,
            width: maxContentMenu ? 'max-content' : '100%',
            minWidth: maxContentMenu ? '100%' : 'none',
          }),
          option: provided => ({
            ...provided,
            ...(showCheckbox && { ':active': { background: 'white' }, background: 'white' }),
          }),
        },
        isDisabled,
        onChange,
        name,
        ...rest,
      };

      return (
        <div className={clsx(s.block, small && s.small)} style={style} ref={ref}>
          <div className={clsx(s.selectWrap, floatLabel && s.float)}>
            {labelText && (
              <div className={clsx(s.labelText, thinLabel && s.thin, floatLabel && s.float)}>
                {labelText}
              </div>
            )}
            {control ? (
              <Controller
                name={name}
                control={control}
                render={({ field: { ref, ...rest } }) => {
                  return async ? (
                    <AsyncSelect
                      {...rest}
                      {...props}
                      onChange={e => {
                        onChange(e);
                        rest.onChange(e);
                      }}
                    />
                  ) : (
                    <Select
                      {...rest}
                      {...props}
                      onChange={e => {
                        onChange(e);
                        rest.onChange(e);
                      }}
                    />
                  );
                }}
              />
            ) : async ? (
              <AsyncSelect {...props} />
            ) : (
              <Select {...props} />
            )}
          </div>
          {error && <span className={s.error}>{error}</span>}
        </div>
      );
    }
  )
);
