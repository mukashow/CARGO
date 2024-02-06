import s from '../../index.module.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const Receipt = () => {
  const { t } = useTranslation();

  return (
    <div className={s.receipt}>
      <div className={s.box}>
        <p className={s.groupTitle}>{t('cashPaymentType')}</p>
        <div className={s.options}>
          <div className={s.option}>
            <p>{t('sumInDollar').toLowerCase()}:</p>
            <p className={s.value}>10000$</p>
          </div>
          <div className={s.option}>
            <p>{t('sumInSom').toLowerCase()}:</p>
            <p className={s.middleAmount}>89,30 с</p>
            <p className={s.middleAmount}>714 000,00 с</p>
            <p className={s.value}>10000$</p>
          </div>
        </div>
      </div>
      <div className={s.box}>
        <p className={s.groupTitle}>{t('cashlessPaymentType')}</p>
        <div className={s.options}>
          <div className={s.option}>
            <p>{t('sumInDollar').toLowerCase()}:</p>
            <p className={s.value}>10000$</p>
          </div>
          <div className={s.option}>
            <p>{t('sumInSom').toLowerCase()}:</p>
            <p className={s.middleAmount}>89,30 с</p>
            <p className={s.middleAmount}>714 000,00 с</p>
            <p className={s.value}>10000$</p>
          </div>
        </div>
      </div>
      <div className={s.box}>
        <p className={s.totalTitle}>{t('tableClientTotal')}</p>
        <div className={s.options}>
          <div className={s.option}>
            <p>{t('accepted').toLowerCase()}:</p>
            <p className={s.value}>10000$</p>
          </div>
          <div className={s.option}>
            <p>{t('changeMoney').toLowerCase()}:</p>
            <p className={s.value}>10000$</p>
          </div>
        </div>
      </div>
      <div className={s.box}>
        <div className={s.options}>
          <div className={s.option}>
            <p>{t('changeInDollar').toLowerCase()}:</p>
            <p className={s.value}>10000$</p>
          </div>
          <div className={s.option}>
            <p>{t('changeInSom').toLowerCase()}:</p>
            <p className={s.middleAmount}>89,30 с</p>
            <p className={s.middleAmount}>3572,00 с</p>
            <p className={s.value}>10000$</p>
          </div>
        </div>
      </div>
    </div>
  );
};
