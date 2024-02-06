import s from '../index.module.scss';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { ModalViewCar } from '@pages/LoadingListDetail/components/ModalViewCar';
import { ModalViewSeals } from '@pages/LoadingListDetail/components/ModalViewSeals';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { CardInformation, FormCard, Icon } from '@/components';
import { Action } from './Action';

export const Top = ErrorBoundaryHoc(
  ({ isExpenseInjecting, setCancelConfirmModal, tabConfirmFn }) => {
    const loadingList = useSelector(state => state.loadingList.loadingListDetail);
    const [commentOpen, setCommentOpen] = useState(false);
    const [showCommentTrigger, setShowCommentTrigger] = useState(false);
    const [sealsOpen, setSealsOpen] = useState(false);
    const [carsOpen, setCarsOpen] = useState(false);
    const { t } = useTranslation();

    const onCommentRef = target => {
      if (target) {
        setShowCommentTrigger(target.scrollHeight >= 49);
      }
    };

    const card = useMemo(() => {
      return {
        generalData: [
          { title: t('transportationType'), value: loadingList?.transportation_type.name },
          { title: `${t('route')}:`, value: loadingList?.route.map(({ name }) => name).join('-') },
          {
            title: `${t('seal').toLowerCase()}:`,
            value: loadingList?.seal?.number,
          },
        ],
        container: [
          { title: `${t('containerNumber')}:`, value: loadingList?.container?.number },
          { title: `${t('propertyType')}:`, value: loadingList?.container?.property_type.name },
        ],
        car: [
          { title: `${t('carNumber')}:`, value: loadingList?.car?.number },
          { title: `${t('carBrand')}:`, value: loadingList?.car?.brand },
          { title: `${t('carDriver')}:`, value: loadingList?.car?.driver },
          { title: `${t('clientPhone')}:`, value: loadingList?.car?.contact },
          {
            title: `${t('permissibleWeight').toLowerCase()}:`,
            value: loadingList?.car?.max_weight,
          },
          {
            title: `${t('permissibleVolume').toLowerCase()}:`,
            value: loadingList?.car?.max_volume,
          },
        ],
      };
    }, [loadingList]);

    return (
      <>
        <div className={s.top}>
          <div className={s.cards}>
            <FormCard
              cardTitle={t('generalData')}
              topButton={{ title: t('allSeals'), onClick: () => setSealsOpen(true) }}
            >
              <CardInformation information={card.generalData} />
            </FormCard>
            <FormCard cardTitle={t('container')}>
              <CardInformation information={card.container} />
            </FormCard>
            <FormCard
              cardTitle={t('car')}
              topButton={{ title: t('allAuto'), onClick: () => setCarsOpen(true) }}
            >
              <CardInformation information={card.car} />
            </FormCard>
          </div>
          <Action
            car={loadingList?.car}
            container={loadingList?.container}
            canDelete={loadingList?.can_delete}
            can_add_car={loadingList?.can_add_car}
            can_add_container={loadingList?.can_add_container}
            can_add_seal={loadingList?.can_add_seal}
            can_delete_seal={!!loadingList?.seal && loadingList?.can_delete_seal}
            sealId={loadingList?.seal?.id}
            onEdit={
              isExpenseInjecting
                ? fn => {
                    setCancelConfirmModal(true);
                    tabConfirmFn.current = fn;
                  }
                : null
            }
          />
        </div>
        <div className={s.comment}>
          {loadingList?.comment && (
            <>
              <Icon iconId="comment" iconWidth={30} iconHeight={30} />
              <p ref={onCommentRef} className={clsx(commentOpen && s.open)}>
                {loadingList.comment}
              </p>
              {showCommentTrigger && (
                <div className={s.readMore}>
                  <span onClick={() => setCommentOpen(!commentOpen)}>
                    {t(commentOpen ? 'shrink' : 'readMoreText')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <ModalViewSeals isOpen={sealsOpen} close={() => setSealsOpen(false)} />
        <ModalViewCar isOpen={carsOpen} close={() => setCarsOpen(false)} />
      </>
    );
  }
);
