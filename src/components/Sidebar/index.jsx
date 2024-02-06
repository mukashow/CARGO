import React from 'react';
import s from './index.module.scss';
import { Navigation } from './components/Navigation';
import { Settings } from './components/Settings';

export const Sidebar = () => {
  return (
    <div className={s.root}>
      <div className={s.sticky}>
        <Navigation />
        <Settings />
      </div>
    </div>
  );
};
