import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { GoodsModal } from '@pages/PaymentInvoice/Detail/components/GoodsModal';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Tabs as AppTabs } from '@/components';
import { fetchGoodsForBillAdding } from '@actions';

export const Tabs = ErrorBoundaryHoc(() => {
  const roleId = useSelector(state => state.auth.user.role_id);
  const [activeTab, setActiveTab] = useState('goods');
  const [addGoodsModal, setAddGoodsModal] = useState(false);
  const [goodsFetching, setGoodsFetching] = useState(false);
  const dispatch = useDispatch();
  const { id } = useParams();

  const fetchGoods = () => {
    setAddGoodsModal(true);
    setGoodsFetching(true);
    dispatch(fetchGoodsForBillAdding(id)).finally(() => setGoodsFetching(false));
  };

  const tabs = useMemo(() => {
    return [
      {
        title: 'goods',
        tags: [],
        onButtonClick: (roleId === 1 || roleId === 3) && fetchGoods,
        buttonTitle: 'addCargo',
      },
      {
        title: 'expenses',
      },
      {
        title: 'tableDoc',
      },
    ];
  }, [id]);

  return (
    <div style={{ marginTop: 'clamp(40px, 5vw, 90px)' }}>
      <AppTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <GoodsModal
        isOpen={addGoodsModal}
        close={() => setAddGoodsModal(false)}
        goodsFetching={goodsFetching}
      />
    </div>
  );
});
