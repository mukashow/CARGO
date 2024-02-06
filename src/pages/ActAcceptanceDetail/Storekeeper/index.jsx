import React, { useEffect, useMemo, useState } from 'react';
import s from '../index.module.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CardInformation,
  FormCard,
  Header,
  Loader,
  ModalAction,
  ModalDecipheringPlaces,
  Tabs,
} from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { GoodsTable, PlaceAddForm } from './components';
import {
  fetchStorekeeperGoodsAcceptanceInfo,
  fetchGoodsTypeWithTnved,
  fetchPlacesByTnved,
  finishActAcceptance,
  setGoodsDetail,
} from '@/store/actions';

export const StorekeeperActAcceptanceDetail = ErrorBoundaryHoc(() => {
  const { goodsDetail, placesByTnved } = useSelector(state => ({
    goodsDetail: state.goods.goodsDetail,
    placesByTnved: state.goods.placesByTnved,
  }));
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { actId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const generalData = useMemo(() => {
    if (!goodsDetail) return [];
    const {
      transportation_type,
      direction: { point_from_name, point_to_name, custom_clearance_country_name },
    } = goodsDetail;

    return [
      { title: t('transportationType'), value: transportation_type.name },
      {
        title: t('direction'),
        value: `${point_from_name}-${
          custom_clearance_country_name ? `${custom_clearance_country_name}-` : ''
        }${point_to_name}`,
      },
    ];
  }, [goodsDetail]);

  const goodsTags = useMemo(() => {
    if (!goodsDetail) return [];
    if (!goodsDetail.total_of_goods_by_type.length) return [];
    const { place_count, volume, weight } = goodsDetail.total;
    return [
      `${place_count} ${place_count === 1 ? t('seat') : t('seats')}`,
      `${weight} ${t('weightKg')}`,
      `${volume} ${t('cubicMeter')}`,
    ];
  }, [goodsDetail]);

  const isEnterInventoryBtnActive = useMemo(() => {
    if (!goodsDetail) return;
    return (
      (goodsDetail.status === 1 || goodsDetail.status === 2) && !goodsDetail.is_acceptance_finished
    );
  }, [goodsDetail]);

  const onConfirmFinishAct = () => {
    dispatch(finishActAcceptance({ id: actId }))
      .unwrap()
      .then(() => setIsInventoryMode(false))
      .finally(() => setConfirmModalOpen(false));
  };

  const onViewPlace = tnved => {
    dispatch(fetchPlacesByTnved({ id: actId, tnved }))
      .unwrap()
      .then(() => setPlaceModalOpen(true));
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchStorekeeperGoodsAcceptanceInfo({ id: actId, navigate })).finally(() =>
      setLoading(false)
    );
  }, [actId]);

  useEffect(() => {
    dispatch(fetchGoodsTypeWithTnved());
    const onBackButton = () => {
      if (state?.path) navigate(state.path);
      window.removeEventListener('popstate', onBackButton);
    };
    window.addEventListener('popstate', onBackButton);

    return () => {
      dispatch(setGoodsDetail(null));
    };
  }, []);

  useEffect(() => {
    if (isEnterInventoryBtnActive) {
      setIsInventoryMode(goodsDetail.is_acceptance_started);
    }
  }, [isEnterInventoryBtnActive]);

  return (
    <>
      <Header
        submitButtonProps={{
          isOrange:
            !isInventoryMode && isEnterInventoryBtnActive && !goodsDetail.is_acceptance_started,
        }}
        submitButtonValue={t(
          !isInventoryMode && isEnterInventoryBtnActive && !goodsDetail.is_acceptance_started
            ? 'enterInventory'
            : 'completeInventory'
        )}
        onClick={
          isEnterInventoryBtnActive
            ? !isInventoryMode && !goodsDetail.is_acceptance_started
              ? () => setIsInventoryMode(true)
              : goodsDetail?.is_acceptance_started
              ? () => setConfirmModalOpen(true)
              : null
            : null
        }
        title={`${t('acceptanceReport')} #${actId}`}
        status={goodsDetail?.status_name}
        statusId={goodsDetail?.status}
        statusType="goodsAcceptance"
        statusAuthor={`${goodsDetail?.creator_name} ${goodsDetail?.creator_last_name}`}
        statusDate={goodsDetail?.created_at.slice(0, 10)}
      />
      <ModalAction
        isOpen={confirmModalOpen}
        title={t('toCompleteInventory')}
        description={t('toCompleteInventoryDescription')}
        onCancel={() => setConfirmModalOpen(false)}
        onSubmit={onConfirmFinishAct}
      />
      <ModalDecipheringPlaces
        isOpen={placeModalOpen}
        close={() => setPlaceModalOpen(false)}
        placesByTnved={placesByTnved}
      />
      <Box style={window.innerWidth > 1440 ? { padding: '40px 24px 24px' } : { padding: 24 }}>
        {loading ? (
          <Loader />
        ) : (
          goodsDetail && (
            <>
              <div className={s.top} style={{ display: 'block' }}>
                <div className={s.cards}>
                  <FormCard cardTitle={t('receiver')}>
                    <CardInformation
                      information={[{ title: t('code'), value: goodsDetail?.receiver_code }]}
                    />
                  </FormCard>
                  <FormCard cardTitle={t('sender')}>
                    <CardInformation
                      information={[{ title: t('code'), value: goodsDetail?.sender_code }]}
                    />
                  </FormCard>
                  <FormCard cardTitle={t('generalData')}>
                    <CardInformation information={generalData} />
                  </FormCard>
                </div>
              </div>
              <Tabs
                tabs={[{ title: 'goods', tags: goodsTags }]}
                activeTab="goods"
                setActiveTab={() => {}}
              />
              {isInventoryMode ? (
                <div style={{ marginBottom: 24 }}>
                  <PlaceAddForm onViewPlace={onViewPlace} />
                </div>
              ) : null}
              <GoodsTable goods={goodsDetail?.total_of_goods_by_type} onViewPlace={onViewPlace} />
            </>
          )
        )}
      </Box>
    </>
  );
});
