import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setConfirmChangePath, setConfirmModalOpen } from '@slices/routing';

export const useConfirmNavigate = (confirm = true) => {
  const { pathToNavigate, confirmModalOpen } = useSelector(state => ({
    pathToNavigate: state.routing.pathToNavigate,
    confirmModalOpen: state.routing.confirmModalOpen,
  }));
  const [backModalOpen, setBackModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const backConfirmPromise = useRef(() => {});
  const dispatch = useDispatch();

  const onCancel = () => {
    setBackModalOpen(false);
    dispatch(setConfirmModalOpen(false));
    window.history.pushState(null, null, window.location.pathname);
  };

  const confirmCleaner = () => {
    dispatch(setConfirmChangePath(false));
    dispatch(setConfirmModalOpen(false));
  };

  useEffect(() => {
    if (confirmModalOpen) {
      setBackModalOpen(true);
      backConfirmPromise.current = () => {
        confirmCleaner();
        if (pathToNavigate) navigate(pathToNavigate);
      };
    } else {
      backConfirmPromise.current = () => {
        confirmCleaner();
      };
    }
  }, [confirmModalOpen]);

  useEffect(() => {
    const onReload = event => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    const onBack = async e => {
      e.preventDefault();
      setBackModalOpen(true);
      await new Promise(resolve => {
        backConfirmPromise.current = resolve;
      });
      setBackModalOpen(false);
      confirmCleaner();
      navigate(-1);
    };

    if (!confirm) {
      window.removeEventListener('beforeunload', onReload);
      window.removeEventListener('popstate', onBack);
      confirmCleaner();
      return;
    }

    dispatch(setConfirmChangePath(true));
    window.history.pushState(
      null,
      null,
      window.location.pathname + (`${searchParams}`.length ? `?${searchParams}` : '')
    );
    window.addEventListener('beforeunload', onReload);
    window.addEventListener('popstate', onBack);

    return () => {
      window.removeEventListener('beforeunload', onReload);
      window.removeEventListener('popstate', onBack);
      confirmCleaner();
    };
  }, [confirm]);

  return [backModalOpen, backConfirmPromise.current, onCancel, setBackModalOpen];
};
