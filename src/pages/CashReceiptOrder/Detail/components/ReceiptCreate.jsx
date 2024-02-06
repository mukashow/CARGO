import s from '../../index.module.scss';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNumericFormat } from 'react-number-format';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import clsx from 'clsx';
import * as yup from 'yup';
import { Button, Icon, Input } from '@components';

const BUTTONS = [
  { title: 'cashPaymentMethodInDollar', key: 'cashDollar' },
  { title: 'cashlessPaymentMethodInDollar', key: 'cashlessDollar' },
  { title: 'cashPaymentMethodInSom', key: 'cashSom', isSom: true },
  { title: 'cashlessPaymentMethodInSom', key: 'cashlessSom', isSom: true },
];

const FIELDS = [
  {
    title: 'cashPaymentType',
    dollarKey: 'cashDollar',
    som: {
      exchangeKey: 'cashSomExchangeRate',
      key: 'cashSom',
      inDollarKey: 'cashSomInDollar',
    },
  },
  {
    title: 'cashlessPaymentType',
    dollarKey: 'cashlessDollar',
    som: {
      exchangeKey: 'cashlessSomExchangeRate',
      key: 'cashlessSom',
      inDollarKey: 'cashlessSomInDollar',
    },
  },
];

export const ReceiptCreate = () => {
  const [filledSum, setFilledSum] = useState({
    cashDollar: false,
    cashlessDollar: false,
    cashSom: false,
    cashlessSom: false,
  });
  const { t } = useTranslation();
  const req = key =>
    yup.lazy(() =>
      filledSum[key] ? yup.string().required(t('fieldShouldBeFilled')) : yup.string()
    );
  const schema = yup.object({
    cashDollar: req('cashDollar'),
    cashlessDollar: req('cashlessDollar'),
    cashSom: req('cashSom'),
    cashlessSom: req('cashlessSom'),
    changeSom: yup.lazy(() =>
      Object.values(filledSum).some(v => !!v)
        ? yup.string().required(t('fieldShouldBeFilled'))
        : yup.string()
    ),
    changeDollar: yup.lazy(() =>
      Object.values(filledSum).some(v => !!v)
        ? yup.string().required(t('fieldShouldBeFilled'))
        : yup.string()
    ),
  });
  const {
    register,
    formState: { errors },
    handleSubmit,
    resetField,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { format, removeFormatting } = useNumericFormat({
    thousandSeparator: ' ',
    decimalSeparator: ',',
    decimalScale: 2,
    fixedDecimalScale: true,
    suffix: ' $',
  });
  const unFormat = str => (str ? Number(removeFormatting(str)) : 0);
  const values = watch();

  useEffect(() => {
    if (Object.values(filledSum).every(v => !v)) {
      setValue('changeDollar', undefined);
      setValue('changeSomInDollar', undefined);
      setValue('changeSomRate', undefined);
    }
  }, [filledSum]);

  useEffect(() => {
    setValue('cashSomExchangeRate', '89,1 c');
    setValue('cashlessSomExchangeRate', '89,1 c');
    setValue('changeSomRate', '89,1 c');
  }, []);

  return (
    <>
      <div className={s.paymentMethodButtons}>
        {BUTTONS.map(({ title, key, isSom }) => {
          if (filledSum[key]) return null;
          const props = {
            key: key,
            value: t(title),
            lightBlue: true,
            iconLeftId: 'plusCircle',
            iconWidth: 20,
            iconHeight: 20,
            isSmall: true,
            onClick: () => setFilledSum({ ...filledSum, [key]: true }),
          };
          if (!isSom) {
            return <Button {...props} />;
          }
          return <Button {...props}>c</Button>;
        })}
      </div>
      {Object.values(filledSum).some(v => !!v) && (
        <div className={clsx(s.receipt, s.create)}>
          {FIELDS.map(({ dollarKey, som: { key, exchangeKey, inDollarKey }, title }, i) => {
            if (!filledSum[dollarKey] && !filledSum[key]) return null;

            return (
              <div className={s.box} style={{ marginBottom: i === 0 ? 16 : 0 }} key={i}>
                <p className={s.groupTitle}>{t(title)}</p>
                <div className={s.inputGrid}>
                  {filledSum[dollarKey] && (
                    <div className={s.row}>
                      <Input
                        register={register}
                        name={dollarKey}
                        placeholder="$"
                        formatInput
                        formatInputProps={{ suffix: ' $' }}
                        endText={
                          values[dollarKey] && `= ${format(unFormat(values[dollarKey]).toString())}`
                        }
                        containerStyle={{ flexGrow: 1 }}
                        errors={errors[dollarKey]?.message}
                      />
                      <Icon
                        iconId="trash"
                        color="#DF3B57"
                        onClick={() => {
                          setFilledSum({ ...filledSum, [dollarKey]: false });
                          resetField(dollarKey);
                        }}
                        clickable
                      />
                    </div>
                  )}
                  {filledSum[key] && (
                    <div className={s.row}>
                      <Input
                        formatInput
                        formatInputProps={{ suffix: ' c' }}
                        name={exchangeKey}
                        defaultValue={89.1}
                        register={register}
                        containerStyle={{ width: 120, flexShrink: 0 }}
                        onValueChange={({ floatValue = 0 }) =>
                          setValue(
                            inDollarKey,
                            format((unFormat(values[key]) / floatValue).toString())
                          )
                        }
                      />
                      <Input
                        placeholder="c"
                        register={register}
                        name={key}
                        errors={errors[key]?.message}
                        formatInput
                        formatInputProps={{ suffix: ' c' }}
                        containerStyle={{ flexGrow: 1 }}
                        endText={values[inDollarKey] && `= ${values[inDollarKey]}`}
                        onValueChange={({ floatValue = 0 }) =>
                          setValue(
                            inDollarKey,
                            format((floatValue / unFormat(values[exchangeKey])).toString())
                          )
                        }
                      />
                      <Icon
                        iconId="trash"
                        color="#DF3B57"
                        onClick={() => {
                          setFilledSum({ ...filledSum, [key]: false });
                          resetField(key);
                          setValue(inDollarKey, undefined);
                        }}
                        clickable
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className={s.total}>
            <p style={{ fontWeight: 500 }}>{t('tableClientTotal')}</p>
            <div>
              <div>
                <span>{t('accepted').toLowerCase()}:</span>
                <span>
                  {format(
                    (
                      unFormat(values.cashDollar) +
                      unFormat(values.cashSomInDollar) +
                      unFormat(values.cashlessDollar) +
                      unFormat(values.cashlessSomInDollar)
                    ).toString()
                  )}
                </span>
              </div>
              <div>
                <span>{t('changeMoney').toLowerCase()}:</span>
                <span>
                  {format(
                    (unFormat(values.changeDollar) + unFormat(values.changeSomInDollar)).toString()
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className={s.box}>
            <p className={s.groupTitle} style={{ color: '#232323', fontWeight: 500 }}>
              {t('changeMoney')}
            </p>
            <div className={s.inputGrid}>
              <div className={s.row}>
                <Input
                  placeholder="$"
                  containerStyle={{ flexGrow: 1 }}
                  register={register}
                  name="changeDollar"
                  formatInput
                  formatInputProps={{ suffix: ' $' }}
                  endText={values.changeDollar && `= ${values.changeDollar}`}
                  errors={errors.changeDollar?.message}
                />
              </div>
              <div className={s.row}>
                <Input
                  formatInput
                  formatInputProps={{ suffix: ' c' }}
                  name="changeSomRate"
                  register={register}
                  defaultValue={89.1}
                  containerStyle={{ width: 120, flexShrink: 0 }}
                  onValueChange={({ floatValue }) =>
                    setValue(
                      'changeSomInDollar',
                      format((unFormat(values.changeSom) / floatValue).toString())
                    )
                  }
                />
                <Input
                  placeholder="c"
                  containerStyle={{ flexGrow: 1 }}
                  register={register}
                  name="changeSom"
                  formatInput
                  formatInputProps={{ suffix: ' c' }}
                  errors={errors.changeSom?.message}
                  onValueChange={({ floatValue }) =>
                    setValue(
                      'changeSomInDollar',
                      format((floatValue / unFormat(values.changeSomRate)).toString())
                    )
                  }
                  endText={
                    values.changeSom && values.changeSomRate && `= ${values.changeSomInDollar}`
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
