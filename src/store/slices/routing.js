import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  confirmChangePath: false,
  pathToNavigate: null,
  confirmModalOpen: false,
};

export const routing = createSlice({
  name: 'routing',
  initialState,
  reducers: {
    setConfirmChangePath: (state, { payload }) => {
      state.confirmChangePath = payload;
    },
    setPathToNavigate: (state, { payload }) => {
      state.pathToNavigate = payload;
    },
    setConfirmModalOpen: (state, { payload }) => {
      state.confirmModalOpen = payload;
    },
  },
});

export const { setConfirmChangePath, setPathToNavigate, setConfirmModalOpen } = routing.actions;

export default routing.reducer;
