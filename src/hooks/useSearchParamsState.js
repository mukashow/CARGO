import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const useSearchParamsState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setSearchParamsState = (newState, replace = false, param = {}) => {
    if (replace) {
      setSearchParams(newState, param);
      return;
    }
    const next = Object.assign(
      {},
      [...searchParams.entries()].reduce((o, [key, value]) => ({ ...o, [key]: value }), {}),
      newState
    );
    setSearchParams(next, param);
  };

  return [searchParams, setSearchParamsState];
};
