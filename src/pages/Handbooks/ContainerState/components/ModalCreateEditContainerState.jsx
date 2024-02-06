import s from '../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  createContainerState,
  fetchAllContainersState,
  fetchContainersState,
  updateContainerState,
} from '@/store/actions';
import * as yup from 'yup';
import { Button, ErrorBoundaryHoc, Input, Modal, ModalAction } from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const ModalCreateEditContainerState = ErrorBoundaryHoc(
  ({ isOpen, close, mode = 'create' }) => {
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const container = useSelector(state => state.container.containerStateOne);
    const [loading, setLoading] = useState(false);
    const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(isOpen);
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();

    const prefixName = yup.lazy((_, { path }) => {
      const locale = {
        name_ru: /ru|ru-RU/,
        name_en: /en|en-US/,
        name_zh_hans: 'zhHans',
      };
      const schema = yup
        .string()
        .max(50, `${t('maxCharactersLength')} 50`)
        .nullable();
      if (mode === 'edit' && !!container[path] && !i18n.language.match(locale[path])) {
        return schema.concat(yup.string().required(t('fieldShouldBeFilled')));
      }
      return schema;
    });

    const schema = yup.object({
      name: yup
        .string()
        .required(t('fieldShouldBeFilled'))
        .max(50, `${t('maxCharactersLength')} 50`),
      name_ru: prefixName,
      name_en: prefixName,
      name_zh_hans: prefixName,
    });
    const resolver = useYupValidationResolver(schema);
    const {
      formState: { errors },
      reset,
      register,
      handleSubmit,
      setError,
      setValue,
    } = useForm({ resolver });

    const onSubmit = async values => {
      setLoading(true);
      try {
        await dispatch(
          mode === 'create'
            ? createContainerState(values)
            : updateContainerState({ ...values, id: container.id })
        ).unwrap();
        dispatch(fetchContainersState(searchParams));
        dispatch(fetchAllContainersState());
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
      if (container && mode === 'edit') {
        const { name, name_en, name_ru, name_zh_hans } = container;
        setValue('name', name);
        if (name_en && !i18n.language.match(/en-US|en/)) setValue('name_en', name_en);
        if (name_ru && !i18n.language.match(/ru-RU|ru/)) setValue('name_ru', name_ru);
        if (name_zh_hans && i18n.language !== 'zhHans') setValue('name_zh_hans', name_zh_hans);
      }
    }, [container]);

    return (
      <Modal isOpen={isOpen} close={() => setCancelConfirm(true)} title={t('containerState')}>
        <form className={s.modal} onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="name"
            register={register}
            errors={errors.name?.message}
            labelText={`${t('stateName').toLowerCase()}:`}
            placeholder={t('modalCreateClientPlaceholder')}
          />
          {i18n.language !== 'zhHans' && (
            <Input
              name="name_zh_hans"
              register={register}
              errors={errors.name_zh_hans?.message}
              labelText={`${t('stateName').toLowerCase()} ${t('inChinese')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/ru|ru-RU/) && (
            <Input
              name="name_ru"
              register={register}
              errors={errors.name_ru?.message}
              labelText={`${t('stateName').toLowerCase()} ${t('inRussian')}:`}
              placeholder={t('enterValueOptional')}
            />
          )}
          {!i18n.language.match(/en|en-US/) && (
            <Input
              name="name_en"
              register={register}
              errors={errors.name_en?.message}
              labelText={`${t('stateName').toLowerCase()} ${t('inEnglish')}:`}
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
          title={t(
            mode === 'create' ? 'toCancelContainerStateCreation' : 'toCancelContainerStateEditing'
          )}
          description={t('toCancelContainerStateCreationDescription')}
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
