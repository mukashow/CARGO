import s from '../ActAcceptanceDetail/index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { Box, Header, Loader } from '@/components';
import {
  fetchContainerDocuments,
  fetchContainerOne,
  fetchFilesType,
  setGoodsDetail,
} from '@actions';
import { Actions, Cards, Tabs } from './components';

export const ContainerDetail = ErrorBoundaryHoc(() => {
  const container = useSelector(state => state.container.containerOne);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { containerId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
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
    setLoading(true);
    dispatch(fetchContainerOne(containerId));
    dispatch(fetchFilesType());
    dispatch(fetchContainerDocuments(containerId))
      .unwrap()
      .catch(status => {
        if (status === 404) {
          navigate(`/warehouse?tab=containers&page=1&page_size=25`, { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [containerId]);

  return (
    <>
      <Header
        title={`${t('container')} #${container?.number}`}
        status={container?.status?.name}
        statusId={container?.status?.id}
        statusType="container"
        statusAuthor={container?.created_by?.name}
        statusDate={container?.created_at?.slice(0, 10)}
      />
      <Box style={window.innerWidth > 1440 ? { padding: '40px 24px 24px' } : { padding: 24 }}>
        {loading ? (
          <Loader />
        ) : (
          container && (
            <>
              <div className={s.top}>
                <Cards />
                <Actions />
              </div>
              <Tabs />
            </>
          )
        )}
      </Box>
    </>
  );
});
