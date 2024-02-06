import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as ReactLink, useLocation } from 'react-router-dom';
import { setConfirmModalOpen, setPathToNavigate } from '@slices/routing';
import { ErrorBoundaryHoc } from '@components';

export const Link = ErrorBoundaryHoc(({ to, children, onClick = () => {}, ...rest }) => {
  const confirmChangePath = useSelector(state => state.routing.confirmChangePath);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const onNavigate = e => {
    onClick();
    if (confirmChangePath) {
      e.preventDefault();
      dispatch(setPathToNavigate(to));
      dispatch(setConfirmModalOpen(true));
    }
  };

  return (
    <ReactLink
      {...rest}
      to={to}
      onClick={onNavigate}
      style={{ pointerEvents: pathname === to ? 'none' : 'unset' }}
    >
      {children}
    </ReactLink>
  );
});
