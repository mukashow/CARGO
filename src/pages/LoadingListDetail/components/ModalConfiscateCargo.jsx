import s from '../index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { declOfNum } from '@/helpers';
import { fetchLoadingListInfo } from '@/store/actions';
import * as yup from 'yup';
import { ErrorBoundaryHoc, Input, Modal, Table } from '@/components';
import { markConfiscatedPlaces } from '@actions/loadingList';
import { useYupValidationResolver } from '@/hooks';

const HEAD_ROW = [
  'receiverCodeFilter',
  'goodsType',
  'tnVedCode',
  'seatsNumber',
  'weight',
  'volume',
  'markingConfiscatedPlace',
  'reason',
];

const placeSynopsis = ['место', 'места', 'мест'];

export const ModalConfiscateCargo = ErrorBoundaryHoc(({ isOpen, close }) => {
  const goods = useSelector(state => state.loadingList.loadingListDetail);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { loadingListId } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const numberSchema = yup.lazy((value, { parent }) => {
    if (value === '') {
      return yup
        .string()
        .nullable()
        .concat(!!parent.comment && yup.string().required(t('fieldShouldBeFilled')));
    }
    return yup
      .number()
      .typeError(t('enterNumber'))
      .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
      .integer(t('typeInteger'))
      .nullable()
      .transform((_value, originalValue) => Number(String(originalValue).replace(/,/g, '.')))
      .concat(
        !!parent.comment &&
          yup.number().typeError(t('enterNumber')).required(t('fieldShouldBeFilled'))
      );
  });
  const schema = yup.object({
    goods: yup
      .array()
      .of(
        yup.object().shape({
          goods: yup.number(),
          place_count: numberSchema,
          comment: yup
            .string()
            .max(500, `${t('maxCharactersLength')} 500`)
            .nullable(),
        })
      )
      .nullable(),
  });
  const resolver = useYupValidationResolver(schema);
  const {
    handleSubmit,
    control,
    setValue,
    register,
    setError,
    formState: { errors, dirtyFields },
    reset,
    trigger,
  } = useForm({ resolver, defaultValues: { goods: null } });
  const { fields } = useFieldArray({ name: 'goods', control, keyName: 'cargoId' });

  const onConfirm = async ({ goods }) => {
    setConfirmLoading(true);
    dispatch(markConfiscatedPlaces({ loadingListId, goods, setError }))
      .unwrap()
      .then(() => {
        close();
        reset();
        dispatch(fetchLoadingListInfo({ id: loadingListId }));
      })
      .finally(() => setConfirmLoading(false));
  };

  useEffect(() => {
    if (goods) {
      setValue(
        'goods',
        goods.goods_list.map((item, index) => ({
          ...item,
          tnved_code: item.tnved?.code,
          hasComment: !!item.comment,
          place_count: '',
          place_count_display: item.place_count,
          index,
        }))
      );
    }
  }, [goods]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      dispatch(fetchLoadingListInfo({ id: loadingListId })).finally(() => setLoading(false));
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      close={() => {
        reset();
        close();
      }}
      contentStyle={{ padding: '3px 0 0 0', width: '100%', maxWidth: 1610 }}
      outsideCloseBtn
      overflow="visible"
    >
      <Table
        className={s.table}
        loading={loading}
        row={fields}
        footerTags={[
          `${goods?.total.place_count} ${t(goods?.total.place_count === 1 ? 'seat' : 'seats')}`,
          `${goods?.total.weight} ${t('weightKg')}`,
          `${goods?.total.volume} ${t('cubicMeter')}`,
        ]}
        headRow={HEAD_ROW}
        RowComponent={Row}
        rowProps={{ register, errors, trigger, dirtyFields }}
        onFooterBtnClick={handleSubmit(onConfirm)}
        footerBtnDisabled={confirmLoading}
      />
    </Modal>
  );
});

const Row = ErrorBoundaryHoc(
  ({
    item: {
      receiver_code,
      goods_type_name,
      tnved,
      place_count_display,
      weight,
      volume,
      hasComment,
    },
    register,
    errors,
    trigger,
    index,
  }) => {
    const { t, i18n } = useTranslation();

    return (
      <tr className={s.confiscatedTr}>
        <td className={tableStyle.text}>{receiver_code}</td>
        <td className={tableStyle.text} style={{ whiteSpace: 'nowrap' }}>
          {goods_type_name}
        </td>
        <td className={tableStyle.text}>
          <p className={tableStyle.text}>{tnved?.code}</p>
          <p className={tableStyle.text} style={{ color: '#828282' }}>
            {tnved?.name}
          </p>
        </td>
        <td className={tableStyle.text}>
          {place_count_display}{' '}
          {i18n.language.match(/ru|ru-RU/)
            ? declOfNum(place_count_display, placeSynopsis)
            : t('seats')}
        </td>
        <td className={tableStyle.text}>
          {weight} {t('weightKg')}
        </td>
        <td className={tableStyle.text}>
          {volume} {t('cubicMeter')}
        </td>
        <td>
          <Input
            small
            register={register}
            name={`goods.${index}.place_count`}
            errors={
              errors[`goods[${index}].place_count`]?.message ||
              errors.goods?.[index]?.place_count?.message
            }
            onChange={trigger}
          />
        </td>
        <td style={{ maxWidth: 'none' }}>
          <Input
            multiline
            style={{
              minHeight: 32,
              height: 'auto',
              padding: '7px 12px',
              color: '#232323',
              minWidth: 300,
            }}
            rows={1}
            register={register}
            disabled={hasComment}
            name={`goods.${index}.comment`}
            errors={
              errors[`goods[${index}].comment`]?.message || errors.goods?.[index]?.comment?.message
            }
            onChange={trigger}
          />
        </td>
      </tr>
    );
  }
);
