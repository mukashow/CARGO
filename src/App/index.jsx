import s from './app.module.scss';
import './style.scss';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { routes } from '@/App/Routes';
import { SignIn } from '@/pages';
import { Sidebar } from '@/components';

export const App = () => {
  const { token, roleId, exited } = useSelector(state => ({
    token: state.auth.user?.access,
    roleId: state.auth.user?.role_id,
    exited: state.auth.user?.exited,
  }));

  const Routes = useMemo(() => {
    return routes[roleId];
  }, [roleId]);

  useEffect(() => {
    if (exited) {
      window.location.reload();
    }
  }, [exited]);

  return token ? (
    <div className={s.grid}>
      <Sidebar />
      <main className={s.wrapper}>
        <Routes />
        <span />
      </main>
    </div>
  ) : (
    <SignIn />
  );
};
