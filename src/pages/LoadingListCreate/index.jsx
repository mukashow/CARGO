import s from './index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createLoadingList,
  fetchContainersList,
  fetchRouteList,
  fetchTransportationType,
} from '@/store/actions';
import * as yup from 'yup';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import {
  Box,
  Button,
  CardInformation,
  FormCard,
  Header,
  Input,
  ModalAction,
  ModalCreateUpdateContainer,
  SelectCustom,
} from '@/components';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';

export const LoadingListCreate = ErrorBoundaryHoc(() => {
  const roleId = useSelector(state => state.auth.user.role_id);
  const transportationType = useSelector(state => state.transportation.transportationType);
  const { routeList, containersList, warehouseList } = useSelector(state => ({
    routeList: state.warehouse.routeList,
    containersList: state.warehouse.containersList,
    warehouseList: state.warehouse.warehouseList,
  }));
  const [loading, setLoading] = useState(false);
  const [createContainerModal, setCreateContainerModal] = useState(false);
  const [backModalOpen, backConfirmResolve, cancelBack] = useConfirmNavigate();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const selectSchema = yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.number().required(),
    })
    .default(undefined)
    .required(t('fieldShouldBeFilled'))
    .nullable();
  const oneOfFieldFilledSchemaNumber = yup.lazy((value, { parent }) => {
    const numberSchema =
      value === ''
        ? yup.string()
        : yup
            .number()
            .transform((_value, originalValue) =>
              originalValue ? Number(originalValue.replace(/,/g, '.')) : originalValue
            )
            .typeError(t('enterNumber'));

    const someFilled =
      parent.car_number ||
      parent.car_brand ||
      parent.driver_name ||
      parent.driver_contact ||
      parent.car_max_weight ||
      parent.car_max_volume;
    if (someFilled && !parent.container) {
      return numberSchema.required(t('fieldShouldBeFilled'));
    }
    return numberSchema;
  });
  const oneOfFieldFilledSchema = yup.lazy((value, { parent }) => {
    const someFilled =
      parent.car_number ||
      parent.car_brand ||
      parent.driver_name ||
      parent.driver_contact ||
      parent.car_max_weight ||
      parent.car_max_volume;
    if (someFilled) {
      return yup.string().required(t('fieldShouldBeFilled'));
    }
    return yup.string();
  });
  const validationSchema = yup.object({
    transportation_type: selectSchema,
    route: selectSchema,
    warehouse: roleId === 5 ? selectSchema : null,
    car_number: oneOfFieldFilledSchema,
    car_brand: oneOfFieldFilledSchema,
    driver_name: oneOfFieldFilledSchema,
    driver_contact: oneOfFieldFilledSchema,
    car_max_weight: oneOfFieldFilledSchemaNumber,
    car_max_volume: oneOfFieldFilledSchemaNumber,
  });

  const resolver = useYupValidationResolver(validationSchema);
  const {
    reset,
    handleSubmit,
    register,
    control,
    formState: { errors },
    setValue,
    setError,
    watch,
    trigger,
  } = useForm({
    resolver,
    defaultValues: {
      transportation_type: null,
      route: null,
      warehouse: null,
      container: null,
      car_number: '',
      car_brand: '',
      driver_name: '',
      driver_contact: '',
      car_max_weight: '',
      car_max_volume: '',
    },
  });
  const container = watch('container');
  const warehouse = watch('warehouse');

  const onSubmit = values => {
    setLoading(true);
    dispatch(createLoadingList(values))
      .unwrap()
      .then(id => {
        reset();
        navigate(`/loading_list/${id}`, { state: { path: state?.path || '/' } });
      })
      .catch(errors => {
        for (const error in errors) {
          setError(error, { type: 'custom', message: errors[error] });
        }
      })
      .finally(() => setLoading(false));
  };

  const onContainerCreated = async id => {
    const containersList = await dispatch(fetchContainersList(warehouse?.value || null)).unwrap();
    setValue('container', containersList.find(({ value }) => value === id) || null);
    setValue('car_max_weight', '');
    setValue('car_max_volume', '');
    trigger([
      'car_number',
      'car_brand',
      'driver_name',
      'driver_contact',
      'car_max_weight',
      'car_max_volume',
    ]);
  };

  useEffect(() => {
    if (roleId !== 5) {
      dispatch(fetchRouteList());
      dispatch(fetchContainersList());
    }
    dispatch(fetchTransportationType())
      .unwrap()
      .then(options => setValue('transportation_type', options[0]));
  }, []);

  return (
    <>
      <ModalAction
        isOpen={backModalOpen}
        title={t('toCancelLoadingListCreation')}
        onSubmit={backConfirmResolve}
        onCancel={cancelBack}
      />
      <Header title={t('loadingList')} className={s.header} />
      <Box style={{ flexGrow: 0 }}>
        <div className={s.content}>
          <div className={s.formWrap}>
            <form className={s.form}>
              <FormCard
                topTitle={t('addingLoadingListData')}
                index={0}
                cardTitle={t('generalData')}
                className={s.card}
              >
                <div className={s.selectsWrap}>
                  <SelectCustom
                    control={control}
                    name="transportation_type"
                    options={transportationType}
                    labelText={t('transportationType')}
                    placeholder={t('selectRequired')}
                    error={errors.transportation_type?.message}
                  />
                  {roleId === 5 && (
                    <SelectCustom
                      control={control}
                      name="warehouse"
                      options={warehouseList?.map(({ id, name }) => ({ value: id, label: name }))}
                      onChange={({ value }) => {
                        setValue('route', null);
                        setValue('container', null);
                        dispatch(fetchRouteList(value));
                        dispatch(fetchContainersList(value));
                      }}
                      labelText={t('warehouse')}
                      placeholder={t('selectRequired')}
                      error={errors.warehouse?.message}
                    />
                  )}
                  <SelectCustom
                    isDisabled={roleId === 5 && !warehouse}
                    control={control}
                    name="route"
                    options={routeList || []}
                    labelText={t('route') + ':'}
                    placeholder={t('selectRequired')}
                    error={
                      roleId === 5 ? warehouse && errors.route?.message : errors.route?.message
                    }
                  />
                </div>
              </FormCard>
              <FormCard
                topTitle={t('addingContainerData')}
                index={1}
                cardTitle={t('container')}
                className={s.card}
              >
                <SelectCustom
                  isDisabled={roleId === 5 && !warehouse}
                  isClearable
                  control={control}
                  name="container"
                  options={containersList || []}
                  onChange={() => {
                    setValue('car_max_weight', '');
                    setValue('car_max_volume', '');
                    trigger([
                      'car_number',
                      'car_brand',
                      'driver_name',
                      'driver_contact',
                      'car_max_weight',
                      'car_max_volume',
                    ]);
                  }}
                  labelText={t('container').toLowerCase() + ':'}
                  placeholder={t('modalCreateClientPlaceholderSelectRequired')}
                  error={errors.container?.message}
                />
                <CardInformation
                  className={s.information}
                  information={[
                    { title: `${t('propertyType')}: `, value: container?.property_type },
                  ]}
                />
                <div style={{ marginBottom: 24 }} />
                <Button
                  onClick={() => setCreateContainerModal(true)}
                  value={i18n.language.match(/ru|ru-RU/) ? 'Создать новый' : t('createNew')}
                  isSmall
                  iconLeftId="blue-plus"
                  lightBlue
                  style={{ marginTop: 'auto' }}
                  disabled={roleId === 5 && !warehouse}
                />
              </FormCard>
              <FormCard
                topTitle={t('addingCarData')}
                index={2}
                cardTitle={t('car')}
                className={s.card}
              >
                <div className={s.selectsWrap}>
                  <Input
                    register={register}
                    name="car_number"
                    labelText={t('carNumber') + ':'}
                    placeholder={t('modalCreateClientPlaceholderRequired')}
                    errors={errors.car_number?.message}
                  />
                  <Input
                    register={register}
                    name="car_brand"
                    labelText={t('carBrand') + ':'}
                    placeholder={t('modalCreateClientPlaceholderRequired')}
                    errors={errors.car_brand?.message}
                  />
                  <Input
                    register={register}
                    name="driver_name"
                    labelText={t('carDriver') + ':'}
                    placeholder={t('modalCreateClientPlaceholderRequired')}
                    errors={errors.driver_name?.message}
                  />
                  <Input
                    register={register}
                    name="driver_contact"
                    labelText={t('driverContacts') + ':'}
                    placeholder={t('modalCreateClientPlaceholderRequired')}
                    errors={errors.driver_contact?.message}
                  />
                  {!container && (
                    <>
                      <Input
                        register={register}
                        name="car_max_weight"
                        labelText={t('weight') + ':'}
                        placeholder={t('modalCreateClientPlaceholderRequired')}
                        errors={errors.car_max_weight?.message}
                      />
                      <Input
                        register={register}
                        name="car_max_volume"
                        labelText={t('volume') + ':'}
                        placeholder={t('modalCreateClientPlaceholderRequired')}
                        errors={errors.car_max_volume?.message}
                      />
                    </>
                  )}
                </div>
              </FormCard>
            </form>
          </div>
        </div>
      </Box>
      <div className={s.footer}>
        <Button
          value={t('modalCreateClientCreate')}
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          isBlue
        />
        <Button value={t('cancel')} onClick={() => navigate(-1)} />
      </div>
      <ModalCreateUpdateContainer
        isOpen={createContainerModal}
        close={() => setCreateContainerModal(false)}
        callback={onContainerCreated}
        defaultValues={{
          warehouse: warehouse ? { id: warehouse.value, name: warehouse.label } : null,
        }}
        disabledFields={{ warehouse: true }}
      />
    </>
  );
});
