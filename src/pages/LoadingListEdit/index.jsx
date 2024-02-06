import React, { useEffect, useState } from 'react';
import s from './index.module.scss';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  Header,
  Box,
  ModalAction,
  FormCard,
  SelectCustom,
  CardInformation,
  Button,
  Input,
  ModalCreateUpdateContainer,
} from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { useConfirmNavigate, useYupValidationResolver } from '@/hooks';
import {
  fetchContainersList,
  fetchRouteList,
  fetchTransportationType,
  updateLoadingList,
  fetchLoadingListInfo,
  fetchCanUpdateLoadingList,
} from '@/store/actions';

export const LoadingListEdit = ErrorBoundaryHoc(() => {
  const transportationType = useSelector(state => state.transportation.transportationType);
  const { routeList, containersList } = useSelector(state => ({
    routeList: state.warehouse.routeList,
    containersList: state.warehouse.containersList,
  }));
  const role = useSelector(state => state.auth.user.role_id);
  const loadingList = useSelector(state => state.loadingList.loadingListDetail);
  const [loading, setLoading] = useState(false);
  const [createContainerModal, setCreateContainerModal] = useState(false);
  const [backModalOpen, backConfirmResolve, cancelBack] = useConfirmNavigate();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { loadingListId } = useParams();
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
  const conditionalSchema = yup.lazy((_, { parent }) => {
    const schema = yup
      .number()
      .nullable()
      .transform((_value, originalValue) =>
        originalValue && typeof originalValue === 'string'
          ? Number(originalValue.replace(/,/g, '.'))
          : originalValue
      );

    if (!parent.container) {
      return schema.required(t('fieldShouldBeFilled')).typeError(t('enterNumber'));
    }
    return schema;
  });
  const oneOfFieldFilledSchema = yup.lazy((_, { parent }) => {
    if (!parent.container) return yup.string().required(t('fieldShouldBeFilled')).nullable();
    return yup.string().nullable();
  });
  const validationSchema = yup.object({
    transportation_type: selectSchema,
    route: selectSchema,
    car_number: oneOfFieldFilledSchema,
    car_brand: oneOfFieldFilledSchema,
    driver_name: oneOfFieldFilledSchema,
    driver_contact: oneOfFieldFilledSchema,
    car_max_weight: conditionalSchema,
    car_max_volume: conditionalSchema,
  });

  const resolver = useYupValidationResolver(validationSchema);
  const {
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
      car_max_weight: null,
      car_max_volume: null,
    },
  });
  const container = watch('container');
  const warehouse = watch('warehouse');

  const onSubmit = values => {
    setLoading(true);
    dispatch(updateLoadingList({ ...values, id: loadingListId }))
      .unwrap()
      .then(() => navigate(`/loading_list/${loadingListId}`))
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
    setValue('car_max_weight', null);
    setValue('car_max_volume', null);
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
    dispatch(fetchCanUpdateLoadingList(loadingListId))
      .unwrap()
      .then(({ can_update }) => {
        if (!can_update) {
          navigate(`/loading_list/${loadingListId}`);
        }
      });
    dispatch(fetchLoadingListInfo({ id: loadingListId, navigate }))
      .unwrap()
      .then(
        ({
          transportation_type,
          warehouse,
          warehouse_name,
          route,
          route_id,
          container_id,
          container,
          car,
        }) => {
          dispatch(fetchRouteList(warehouse));
          dispatch(fetchContainersList(warehouse));
          if (container) {
            setValue('container', {
              value: container_id,
              label: container.number,
              property_type: container.property_type.name,
            });
          }
          setValue('route', { value: route_id, label: route.map(({ name }) => name).join(' - ') });
          setValue('transportation_type', {
            label: transportation_type.name,
            value: transportation_type.id,
          });
          setValue('warehouse', {
            label: warehouse_name,
            value: warehouse,
          });
          setValue('car_number', car?.number);
          setValue('car_brand', car?.brand);
          setValue('car_max_weight', car?.max_weight);
          setValue('car_max_volume', car?.max_volume);
          setValue('driver_name', car?.driver);
          setValue('driver_contact', car?.contact);
        }
      );
    dispatch(fetchTransportationType());
  }, []);

  return (
    <>
      <ModalAction
        isOpen={backModalOpen}
        title={t('toCancelChangingLoadingList')}
        onSubmit={backConfirmResolve}
        onCancel={cancelBack}
      />
      <Header
        title={`${t('loadingList')} #${loadingListId}`}
        status={loadingList?.status_name}
        statusId={loadingList?.status}
        statusDate={loadingList?.created_at.slice(0, 10)}
        statusAuthor={loadingList?.creator_last_name + loadingList?.creator_name}
      />
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
                  <SelectCustom
                    control={control}
                    name="route"
                    options={routeList || []}
                    labelText={t('route') + ':'}
                    placeholder={t('selectRequired')}
                    error={errors.route?.message}
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
                  control={control}
                  isClearable
                  name="container"
                  options={containersList || []}
                  labelText={t('container').toLowerCase() + ':'}
                  onChange={() => {
                    setValue('car_max_weight', null);
                    setValue('car_max_volume', null);
                    trigger([
                      'car_number',
                      'car_brand',
                      'driver_name',
                      'driver_contact',
                      'car_max_weight',
                      'car_max_volume',
                    ]);
                  }}
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
                    placeholder={t('enterValueOptional')}
                    errors={errors.car_number?.message}
                  />
                  <Input
                    register={register}
                    name="car_brand"
                    labelText={t('carBrand') + ':'}
                    placeholder={t('enterValueOptional')}
                    errors={errors.car_brand?.message}
                  />
                  <Input
                    register={register}
                    name="driver_name"
                    labelText={t('carDriver') + ':'}
                    placeholder={t('enterValueOptional')}
                    errors={errors.driver_name?.message}
                  />
                  <Input
                    register={register}
                    name="driver_contact"
                    labelText={t('driverContacts') + ':'}
                    placeholder={t('enterValueOptional')}
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
          value={t('save')}
          isOrange
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
        defaultValues={
          role === 5 && {
            warehouse: warehouse ? { id: warehouse.value, name: warehouse.label } : null,
          }
        }
        disabledFields={{ warehouse: true }}
      />
    </>
  );
});
