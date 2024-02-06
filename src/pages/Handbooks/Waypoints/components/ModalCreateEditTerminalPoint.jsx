import s from '../index.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchCountryCitiesByParams, fetchPhoneCode } from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction, SelectCustom } from '@/components';
import {
  createTerminalPoint,
  fetchPointDirectionsAndRoutes,
  fetchPointList,
  fetchWaypointsAndDirections,
  updateTerminalPoint,
} from '@actions/point';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditTerminalPoint = ErrorBoundaryHoc(
  ({ isOpen, close, mode = 'create', setFieldLabel, expandedPoints }) => {
    const countries = useSelector(state => state.phone.phoneCode);
    const terminalPoint = useSelector(state => state.point.terminalPoint);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const { t, i18n } = useTranslation();
    const firstRenderData = useRef(null);
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const schema = yup.object({
      name: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(127, `${t('maxCharactersLength')} 127`),
      name_en: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable(),
      name_zh_hans: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable(),
      name_ru: yup
        .string()
        .max(127, `${t('maxCharactersLength')} 127`)
        .nullable(),
      country: yup.object().required(t('fieldShouldBeFilled')),
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      register,
      reset,
      control,
      handleSubmit,
      setError,
      setValue,
    } = useForm({
      defaultValues: { name: '' },
      resolver,
    });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create'
            ? createTerminalPoint(values)
            : updateTerminalPoint({
                id: terminalPoint.id,
                values,
                firstRenderData: firstRenderData.current,
              })
        ).unwrap();
        await dispatch(fetchWaypointsAndDirections(searchParams));
        expandedPoints.forEach(id => {
          dispatch(fetchPointDirectionsAndRoutes(id));
        });
        dispatch(fetchPointList());
        reset();
        close();
      } catch (errors) {
        for (const key in errors) {
          setError(key, { message: errors[key] });
        }
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (terminalPoint && mode === 'edit') {
        const { name_zh_hans, name_en, name_ru, name, city, country } = terminalPoint;
        firstRenderData.current = { name_zh_hans, name_en, name_ru, name, city, country };
        setValue('name', name);
        setValue('country', country);
        setValue('city', city);
        dispatch(fetchCountryCitiesByParams(`country_id=${country.id}`))
          .unwrap()
          .then(setCities);
        if (i18n.language !== 'zhHans') setValue('name_zh_hans', name_zh_hans);
        if (!i18n.language.match(/en|en-US/)) setValue('name_en', name_en);
        if (!i18n.language.match(/ru|ru-RU/)) setValue('name_ru', name_ru);
      }
    }, [terminalPoint]);

    useEffect(() => {
      if (isOpen) {
        dispatch(fetchPhoneCode());
      }
    }, [isOpen]);

    return (
      <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('terminalPoint')}>
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={setFieldLabel('waypointName')}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          <SelectCustom
            name="country"
            options={countries || []}
            getOptionLabel={option => option.name}
            getOptionValue={option => option.id}
            control={control}
            error={errors.country?.message}
            labelText={`${t('clientCountry')}:`}
            placeholder={t('selectRequired')}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            onChange={({ id }) => {
              dispatch(fetchCountryCitiesByParams(`country_id=${id}`))
                .unwrap()
                .then(cities => {
                  setCities(cities);
                  setValue('city', null);
                });
            }}
          />
          <SelectCustom
            name="city"
            options={cities || []}
            getOptionLabel={option => option.name}
            getOptionValue={option => option.id}
            control={control}
            error={errors.city?.message}
            labelText={`${t('city')}:`}
            placeholder={t('modalCreateClientPlaceholderSelectRequired')}
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('waypointName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('waypointName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('waypointName').toLowerCase()} ${t('inEnglish')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          <div className={s.footer}>
            <Button
              onClick={() => setCancelConfirm(true)}
              textButton
              value={t('modalConfirmLabelCancel')}
              style={{ fontSize: 16 }}
            />
            <Button
              value={t(mode === 'create' ? 'modalConfirmLabelConfirm' : 'save')}
              isBlue={mode === 'create'}
              green={mode === 'edit'}
              type="button"
              disabled={loading}
            />
          </div>
        </form>
        <ModalAction
          title={t(mode === 'create' ? 'toCancelPointCreation' : 'toCancelPointEditing')}
          description={t('pointDataWillNotBeSaved')}
          isOpen={cancelConfirm || backModalOpen}
          onCancel={() => {
            setCancelConfirm(false);
            onCancel();
          }}
          onSubmit={() => {
            setCancelConfirm(false);
            backConfirm();
            reset();
            close();
          }}
        />
      </Modal>
    );
  }
);
