import s from '../index.module.scss';
import tableStyle from '@components/Table/index.module.scss';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import clsx from 'clsx';
import * as yup from 'yup';
import { ErrorBoundaryHoc, Icon, Input, ModalAction } from '@components';
import { editRate, fetchRates } from '@actions';
import { useConfirmNavigate } from '@hooks';

const ERROR_REAL_NAME = {
  buying_rate: 'course',
};

export const Rates = ErrorBoundaryHoc(() => {
  const rates = useSelector(state => state.currency.rates);
  const [createModeRow, setCreateModeRow] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const confirmAction = useRef(() => {});
  const [backModalOpen, backConfirm, onCancel] = useConfirmNavigate(!!createModeRow);

  const numberSchema = yup.lazy(value => {
    if (value === '' || value === null || value === undefined) {
      return yup.string().required(t('fieldShouldBeFilled')).nullable();
    }
    return yup
      .number()
      .typeError(t('enterNumber'))
      .required(t('fieldShouldBeFilled'))
      .moreThan(0, `${t('valueMustBeGreaterThan')} 0`)
      .transform((_, originalValue) => Number(String(originalValue).replace(/,/g, '.')))
      .test({
        message: t('beSureLessNumberAfterComma', { number: 2 }),
        test: number => {
          const decimal = number.toString().split('.')[1];
          return decimal ? decimal.length <= 2 : true;
        },
      });
  });
  const schema = yup.object({
    buying_rate: numberSchema,
  });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      buying_rate: '',
      country: null,
      warehouse: null,
      international_currency: null,
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = async values => {
    try {
      await dispatch(editRate(values)).unwrap();
      dispatch(fetchRates(searchParams.get('country')));
      setCreateModeRow(null);
      reset();
    } catch (errors) {
      for (const key in errors) {
        setError(key, { message: errors[key] });
      }
    }
  };

  const onEdit = ({ index, warehouse, international_currency, buying_rate }) => {
    const prepareData = () => {
      setCreateModeRow({
        index,
        warehouse: warehouse.id,
      });
      setValue('buying_rate', buying_rate);
      setValue('country', rates?.country.id);
      setValue('warehouse', warehouse.id);
      setValue('international_currency', international_currency.id);
    };
    if (createModeRow) {
      setCancelConfirm(true);
      confirmAction.current = prepareData;
      return;
    }
    prepareData();
  };

  return (
    <>
      <div className={s.rates}>
        {rates?.warehouse_list?.map(({ exchange_rate_list, warehouse }) => (
          <div key={warehouse.id} className={s.rateBox}>
            <p>{warehouse.name}</p>
            <table className={clsx(s.rateTable, tableStyle.raw)}>
              <thead>
                <tr>
                  <th>{rates.main_currency.symbol}</th>
                  <th>{t('course').toLowerCase()}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {exchange_rate_list.map((item, index) => {
                  const { international_currency, buying_rate } = item;
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td
                          data-create-mode={
                            createModeRow?.index === index &&
                            createModeRow?.warehouse === warehouse.id
                          }
                        >
                          {international_currency.symbol}
                        </td>
                        {createModeRow?.index === index &&
                        createModeRow?.warehouse === warehouse.id ? (
                          <>
                            <td
                              data-create-mode={
                                createModeRow?.index === index &&
                                createModeRow?.warehouse === warehouse.id
                              }
                            >
                              <Input
                                register={register}
                                name="buying_rate"
                                small
                                style={{ width: 80 }}
                              />
                            </td>
                            <td
                              data-create-mode={
                                createModeRow?.index === index &&
                                createModeRow?.warehouse === warehouse.id
                              }
                              style={{ textAlign: 'right' }}
                            >
                              <div
                                className={tableStyle.textFlex}
                                style={{ justifyContent: 'right' }}
                              >
                                <Icon
                                  iconId="cross"
                                  color="#828282"
                                  clickable
                                  style={{ marginRight: 12 }}
                                  onClick={() => {
                                    setCancelConfirm(true);
                                    confirmAction.current = () => setCreateModeRow(null);
                                  }}
                                />
                                <Icon
                                  iconId="access"
                                  color="#009E61"
                                  clickable
                                  onClick={handleSubmit(onSubmit)}
                                />
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td
                              data-create-mode={
                                createModeRow?.index === index &&
                                createModeRow?.warehouse === warehouse.id
                              }
                            >
                              {buying_rate} {rates.main_currency.symbol}
                            </td>
                            <td
                              data-create-mode={
                                createModeRow?.index === index &&
                                createModeRow?.warehouse === warehouse.id
                              }
                              style={{ textAlign: 'right' }}
                            >
                              <Icon
                                iconId="edit"
                                color="#0B6BE6"
                                iconWidth={20}
                                iconHeight={20}
                                clickable
                                onClick={() => onEdit({ index, ...item, warehouse })}
                              />
                            </td>
                          </>
                        )}
                      </tr>
                      {Object.keys(errors).length > 0 &&
                        createModeRow?.index === index &&
                        createModeRow?.warehouse === warehouse.id && (
                          <tr>
                            <td colSpan={3} style={{ paddingTop: 4 }}>
                              {Object.entries(errors).map(([name, { message }], index) => (
                                <div
                                  className={tableStyle.error}
                                  key={index}
                                  style={{ whiteSpace: 'break-spaces' }}
                                >
                                  {t(ERROR_REAL_NAME[name]).toLowerCase()}: {message}
                                </div>
                              ))}
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <ModalAction
        title={t('toCancelExchangeRateEditing')}
        description={t('CurrencyRateDataWillNotBeSaved')}
        isOpen={cancelConfirm || backModalOpen}
        onCancel={() => {
          setCancelConfirm(false);
          onCancel();
        }}
        onSubmit={() => {
          backConfirm();
          reset();
          onCancel();
          setCancelConfirm(false);
          setCreateModeRow(null);
          confirmAction.current();
        }}
      />
    </>
  );
});
