import s from '@components/Table/index.module.scss';
import mainStyle from '@pages/Handbooks/TransportationRates/index.module.scss';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createTransportationTariff,
  fetchTransportationTariff,
  fetchTransportationTariffs,
} from '@/store/actions';
import clsx from 'clsx';
import * as yup from 'yup';
import { ErrorBoundaryHoc, Icon, Input } from '@/components';
import { useTableActionPosition } from '@hooks/useTableActionPosition';
import { useOutsideClick, useYupValidationResolver } from '@/hooks';

export const Row = ErrorBoundaryHoc(
  ({
    setModalDeleteTariffId,
    setConfirmCancel,
    directionId,
    setCreateMode,
    contract_type,
    item: { createMode, for_volume, kg_in_1_cubic_metre_max, kg_in_1_cubic_metre_min, price, id },
  }) => {
    const tariff = useSelector(state => state.tariff.transportationTariff);
    const [actionOpen, setActionOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [actionOpenerRef, setActionOpenerRef, dropdownRef, setDropdownRef, styles, attributes] =
      useTableActionPosition(true);
    useOutsideClick([actionOpenerRef, dropdownRef], () => setActionOpen(false));

    const numberSchema = yup
      .number()
      .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
      .nullable()
      .typeError(t('enterNumber'))
      .transform((_value, originalValue) =>
        originalValue ? Number(String(originalValue).replace(/,/g, '.')) : originalValue
      );
    const schema = yup.object({
      price: yup.lazy(value =>
        value === ''
          ? yup.string().required(t('modalCreateClientRequired'))
          : numberSchema.required(t('modalCreateClientRequired'))
      ),
      kg_in_1_cubic_metre_min: yup.lazy(value =>
        value === ''
          ? yup.string().required(t('modalCreateClientRequired'))
          : yup
              .number()
              .min(0, `${t('mustBeGreaterOrEqualTo')} 0`)
              .nullable()
              .typeError(t('enterNumber'))
              .transform((_value, originalValue) =>
                originalValue ? Number(String(originalValue).replace(/,/g, '.')) : originalValue
              )
      ),
      kg_in_1_cubic_metre_max: yup.lazy(value =>
        value === '' ? yup.string().nullable() : numberSchema
      ),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      setValue,
      register,
      setError,
      watch,
      handleSubmit,
      clearErrors,
      reset,
      formState: { errors },
    } = useForm({ resolver, defaultValues: { for_volume: true } });
    const forVolume = watch('for_volume');

    const onEdit = () => {
      setActionOpen(false);
      setEditMode(true);
      dispatch(fetchTransportationTariff(id));
    };

    const onSubmit = async values => {
      try {
        await dispatch(createTransportationTariff(values)).unwrap();
        dispatch(
          fetchTransportationTariffs(
            `transportation_type_id=${searchParams.get('transportation_type_id')}&direction_id=${
              tariff?.direction || directionId
            }`
          )
        );
        reset();
        setEditMode(false);
        setCreateMode(false);
      } catch (errors) {
        for (const key in errors) {
          setError(key, { message: errors[key] });
        }
      }
    };

    const onCancel = () => {
      if (createMode) {
        setConfirmCancel({
          func: () => {
            setCreateMode(false);
            clearErrors();
            reset();
          },
        });
      } else {
        setEditMode(false);
        clearErrors();
        reset();
      }
    };

    useEffect(() => {
      if (tariff && editMode) {
        setValue('for_volume', tariff.for_volume);
        setValue('direction', tariff.direction);
        setValue('contract_type', tariff.contract_type);
        setValue('transportation_type', tariff.transportation_type);
        setValue('kg_in_1_cubic_metre_min', tariff.kg_in_1_cubic_metre_min);
        setValue('kg_in_1_cubic_metre_max', tariff.kg_in_1_cubic_metre_max);
        setValue('price', tariff.price);
      }
    }, [editMode, tariff]);

    useEffect(() => {
      if (createMode) {
        setValue('direction', directionId);
        setValue('contract_type', contract_type);
        setValue('transportation_type', searchParams.get('transportation_type_id'));
        setValue('for_volume', true);
      }
    }, [createMode]);

    return (
      <>
        <tr
          data-edit-mode={editMode || editMode}
          {...((errors.kg_in_1_cubic_metre_min ||
            errors.kg_in_1_cubic_metre_max ||
            errors.price) && {
            style: { borderBottom: 'none' },
          })}
        >
          <td className={s.text}>
            {editMode || createMode ? (
              <div className={s.textFlex} style={{ alignItems: 'flex-start' }}>
                <Input
                  className={mainStyle.dropdownTableInput}
                  containerClassName={mainStyle.dropdownTableErrorInput}
                  placeholder={t('from')}
                  style={{
                    marginRight: 4,
                    fontSize: 12,
                    padding: '0 8px',
                    ...(focusedField === 'kg_in_1_cubic_metre_min' && { borderColor: '#009E61' }),
                    ...(errors.kg_in_1_cubic_metre_min && { borderColor: '#df3b57' }),
                  }}
                  small
                  register={register}
                  name="kg_in_1_cubic_metre_min"
                  onFocus={() => setFocusedField('kg_in_1_cubic_metre_min')}
                  onBlur={() => setFocusedField(null)}
                />
                <Input
                  className={mainStyle.dropdownTableInput}
                  containerClassName={mainStyle.dropdownTableErrorInput}
                  placeholder={t('to')}
                  small
                  style={{
                    fontSize: 12,
                    padding: '0 8px',
                    ...(focusedField === 'kg_in_1_cubic_metre_max' && { borderColor: '#009E61' }),
                    ...(errors.kg_in_1_cubic_metre_max && { borderColor: '#df3b57' }),
                  }}
                  register={register}
                  name="kg_in_1_cubic_metre_max"
                  onFocus={() => setFocusedField('kg_in_1_cubic_metre_max')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            ) : (
              <span style={{ whiteSpace: 'nowrap' }}>
                {!kg_in_1_cubic_metre_max
                  ? `${t('from')} ${kg_in_1_cubic_metre_min} ${t('andMoreKg')}`
                  : `${t('from')} ${kg_in_1_cubic_metre_min} ${t(
                      'to'
                    )} ${kg_in_1_cubic_metre_max} ${t('weightKg')}`}
              </span>
            )}
          </td>
          <td className={s.text}>
            {editMode || createMode ? (
              <div className={s.textFlex}>
                <Input
                  style={{
                    width: 42,
                    marginRight: 4,
                    fontSize: 12,
                    padding: '0 6px',
                    cursor: 'pointer',
                  }}
                  small
                  className={clsx(forVolume && mainStyle.dropdownTableInputActive)}
                  placeholder={i18n.language.match(/ru|ru-RU/) ? '1 м3' : '1 m3'}
                  onClick={() => setValue('for_volume', true)}
                  readOnly
                />
                <Input
                  style={{ width: 42, fontSize: 12, padding: '0 6px', cursor: 'pointer' }}
                  small
                  className={clsx(!forVolume && mainStyle.dropdownTableInputActive)}
                  placeholder={i18n.language.match(/ru|ru-RU/) ? '1 кг' : '1 kg'}
                  onClick={() => setValue('for_volume', false)}
                  readOnly
                />
              </div>
            ) : for_volume ? (
              `1 ${t('cubicMeter')}`
            ) : (
              `1 ${t('weightKg')}`
            )}
          </td>
          <td className={s.text}>
            {editMode || createMode ? (
              <Input
                register={register}
                name="price"
                small
                containerClassName={clsx(
                  mainStyle.dropdownTableInputWrap,
                  mainStyle.dropdownTableErrorInput
                )}
                style={{
                  fontSize: 12,
                  padding: '0 8px',
                  ...(focusedField === 'price' && { borderColor: '#009E61' }),
                  ...(errors.price && { borderColor: '#df3b57' }),
                }}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField(null)}
              />
            ) : (
              `${price} $`
            )}
          </td>
          <td style={{ position: 'relative' }}>
            <div className={s.actionWrap} ref={setActionOpenerRef}>
              {editMode || createMode ? (
                <div className={s.textFlex}>
                  <Icon
                    iconId="cross"
                    color="#828282"
                    clickable
                    style={{ marginRight: 12 }}
                    onClick={onCancel}
                  />
                  <Icon
                    iconId="access"
                    color="#009E61"
                    clickable
                    onClick={handleSubmit(onSubmit)}
                  />
                </div>
              ) : (
                <Icon
                  iconClass={s.actionIcon}
                  iconId={actionOpen ? 'cross' : 'dotsThreeCircle'}
                  onClick={() => setActionOpen(!actionOpen)}
                  clickable
                  color="#828282"
                />
              )}
              {actionOpen &&
                createPortal(
                  <div
                    className={s.actionDropdown}
                    ref={setDropdownRef}
                    style={styles.popper}
                    {...attributes.popper}
                    onClick={e => e.stopPropagation()}
                  >
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonBlue}`}
                      onClick={onEdit}
                    >
                      <Icon iconId="edit" />
                      <span>{t('modalCreateClientEdit')}</span>
                    </div>
                    <div
                      className={`${s.actionDropdownButton} ${s.actionDropdownButtonRed}`}
                      onClick={() => setModalDeleteTariffId({ id, directionId })}
                    >
                      <Icon iconId="trash" />
                      <span>{t('delete')}</span>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </td>
        </tr>
        {(errors.kg_in_1_cubic_metre_min || errors.kg_in_1_cubic_metre_max || errors.price) && (
          <tr style={{ height: 'auto' }}>
            <td colSpan={4}>
              <div style={{ fontSize: 11, color: '#df3b57', padding: '1px 0 3px' }}>
                {errors.kg_in_1_cubic_metre_min && (
                  <p>
                    {t('kgInCubicMeter')} {t('from').toLowerCase()}:{' '}
                    {errors.kg_in_1_cubic_metre_min.message}
                  </p>
                )}
                {errors.kg_in_1_cubic_metre_max && (
                  <p>
                    {t('kgInCubicMeter')} {t('to').toLowerCase()}:{' '}
                    {errors.kg_in_1_cubic_metre_max.message}
                  </p>
                )}
                {errors.price && (
                  <p>
                    {t('cost')}: {errors.price.message}
                  </p>
                )}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }
);
