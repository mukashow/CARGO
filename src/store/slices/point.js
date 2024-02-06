import { createSlice } from '@reduxjs/toolkit';
import {
  fetchBorderPointDetail,
  fetchWarehousePointDetail,
  fetchDirectionDetail,
  fetchDirections,
  fetchDirectionsFilter,
  fetchWaypointsAndDirections,
  fetchWaypointsOrdering,
  fetchWaypointsType,
  fetchPointDirectionsAndRoutes,
  fetchPointList,
  fetchRoutes,
  fetchFilterRoutes,
  fetchRouteDetail,
  fetchTransportationTariffs,
  fetchTerminalPointDetail,
} from '@actions/point';

const initialState = {
  waypoints: null,
  ordering: null,
  pointType: null,
  borderPoint: null,
  warehousePoint: null,
  directions: null,
  pointList: null,
  directionsFilter: null,
  direction: null,
  routes: null,
  routesFilter: null,
  route: null,
};

export const point = createSlice({
  name: 'point',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchWaypointsAndDirections.fulfilled]: (state, { payload }) => {
      state.waypoints = payload;
    },
    [fetchWaypointsOrdering.fulfilled]: (state, { payload }) => {
      state.ordering = payload;
    },
    [fetchWaypointsType.fulfilled]: (state, { payload }) => {
      state.pointType = payload;
    },
    [fetchBorderPointDetail.fulfilled]: (state, { payload }) => {
      state.borderPoint = payload;
    },
    [fetchWarehousePointDetail.fulfilled]: (state, { payload }) => {
      state.warehousePoint = payload;
    },
    [fetchTerminalPointDetail.fulfilled]: (state, { payload }) => {
      state.terminalPoint = payload;
    },
    [fetchDirections.fulfilled]: (state, { payload }) => {
      state.directions = payload;
    },
    [fetchDirectionsFilter.fulfilled]: (state, { payload }) => {
      state.directionsFilter = payload;
    },
    [fetchDirectionDetail.fulfilled]: (state, { payload }) => {
      state.direction = payload;
    },
    [fetchPointList.fulfilled]: (state, { payload }) => {
      state.pointList = payload;
    },
    [fetchRoutes.fulfilled]: (state, { payload }) => {
      state.routes = payload;
    },
    [fetchFilterRoutes.fulfilled]: (state, { payload }) => {
      state.routesFilter = payload;
    },
    [fetchRouteDetail.fulfilled]: (state, { payload }) => {
      state.route = payload;
    },
    [fetchTransportationTariffs.fulfilled]: (state, { payload }) => {
      const direction = state.directions.results.find(({ id }) => id === payload.direction.id);
      if (direction) {
        direction.tariffs = payload;
      }
    },
    [fetchPointDirectionsAndRoutes.fulfilled]: (state, { payload }) => {
      const waypoint = state.waypoints.results.find(({ id }) => id === payload.id);
      if (waypoint) {
        waypoint.directions = payload.directions;
        waypoint.routes = payload.routes;
      }
    },
  },
});

export default point.reducer;
