import s from '@pages/ActAcceptanceDetail/index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { uppercase } from '@/helpers';
import clsx from 'clsx';

export const Receipt = React.memo(() => {
  const { t } = useTranslation();

  return (
    <div className={s.receipt}>
      <div className={s.content}>
        <div className={s.group}>
          <p className={s.text}>{t('totalInActs')}</p>
          <div className={s.options}>
            <div className={s.row}>
              <p className={s.blueTitle}>{uppercase(t('act'))} #555</p>
              <p className={s.text}>3 места</p>
              <p className={s.text}>500 кг</p>
              <p className={s.text}>8 м3</p>
              <p className={s.text}>19 900 $</p>
            </div>
            <div className={s.row}>
              <p className={s.blueTitle}>{uppercase(t('act'))} #555</p>
              <p className={s.text}>3 места</p>
              <p className={s.text}>500 кг</p>
              <p className={s.text}>8 м3</p>
              <p className={s.text}>19 900 $</p>
            </div>
          </div>
        </div>
        <div className={s.flexRow} style={{ marginTop: 24 }}>
          <p className={s.text}>{t('totalInExpenses')}</p>
          <p className={s.text}>800 $</p>
        </div>
        <div className={s.border}></div>
        <div className={s.flexRow}>
          <p className={s.totalTitle}>{t('totalSum')}</p>
          <p className={s.text}>30 700 $</p>
        </div>
        <div className={s.border}></div>
        <div className={s.group}>
          <p className={s.text}>{t('cashReceipts')}</p>
          <div className={s.options}>
            <div className={clsx(s.row, s.short)}>
              <div className={s.flexRow}>
                <p className={s.blueTitle}>{t('cashReceiptsShort')} #555</p>
                <p className={s.date}>12.07.2023</p>
              </div>
              <p className={s.text}>1 339 500 с</p>
              <p className={s.text}>{t('course')}: 89,1 с</p>
              <p className={s.text}>19 900 $</p>
            </div>
          </div>
        </div>
        <div className={s.flexRow} style={{ marginTop: 24 }}>
          <p className={s.totalTitle}>{t('totalPaid')}</p>
          <p className={s.totalTitle}>20 000 $</p>
        </div>
        <div className={s.border}></div>
        <div className={s.flexRow}>
          <p className={s.totalTitle}>{t('totalBalance')}</p>
          <p className={s.totalTitle}>20 000 $</p>
        </div>
      </div>
      <img className={s.border} src="/images/pyramidBorder.svg" />
    </div>
  );
});
