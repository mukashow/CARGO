import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { uninterceptedAxiosInstance } from '@/api';
import lodash from 'lodash';

export const fetchWaypointsAndDirections = createAsyncThunk(
  'point/fetchWaypointsAndDirections',
  async searchParams => {
    return (await api(`point/?${searchParams}`)).data;
  }
);

export const fetchWaypointsOrdering = createAsyncThunk('point/fetchWaypointsOrdering', async () => {
  return (await api('point/ordering-fields/')).data;
});

export const fetchWaypointsType = createAsyncThunk('point/fetchWaypointsType', async () => {
  return (await api('point-type/')).data;
});

export const createBorderPoint = createAsyncThunk(
  'point/createBorderPoint',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.post('border-point/create/', body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateBorderPoint = createAsyncThunk(
  'point/updateBorderPoint',
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key] !== null) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.put(`border-point/${id}/update/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const fetchBorderPointDetail = createAsyncThunk('point/fetchBorderPointDetail', async id => {
  return (await api(`border-point/${id}/`)).data;
});

export const createWarehousePoint = createAsyncThunk(
  'point/createWarehousePoint',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.post('warehouse-point/create/', body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateWarehousePoint = createAsyncThunk(
  'point/updateWarehousePoint',
  async ({ id, values, firstRenderData }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (!lodash.isEqual(values[key], firstRenderData[key]) && values[key] !== null) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      if ('warehouse' in body) {
        delete body.city;
      }
      await api.patch(`warehouse-point/${id}/update/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createTerminalPoint = createAsyncThunk(
  'point/createTerminalPoint',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) {
          if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.post('terminal-point/create/', body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateTerminalPoint = createAsyncThunk(
  'point/updateTerminalPoint',
  async ({ id, values, firstRenderData }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (!lodash.isEqual(values[key], firstRenderData[key])) {
          if (values[key] === null) {
            body[key] = null;
          } else if (typeof values[key] === 'object') {
            body[key] = values[key].id;
          } else {
            body[key] = values[key];
          }
        }
      }
      await api.patch(`terminal-point/${id}/update/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const fetchWarehousePointDetail = createAsyncThunk(
  'point/fetchBorderWarehouseDetail',
  async id => {
    return (await api(`warehouse-point/${id}/`)).data;
  }
);

export const fetchTerminalPointDetail = createAsyncThunk(
  'point/fetchTerminalPointDetail',
  async id => {
    return (await api(`terminal-point/${id}/`)).data;
  }
);

export const fetchPointDirectionsAndRoutes = createAsyncThunk(
  'direction/fetchPointDirectionsAndRoutes',
  async id => {
    const data = await Promise.all([
      api(`direction/full/?point=${id}&no_pagination=false`),
      api(`route/?point=${id}&no_pagination=false`),
    ]);
    return { id, directions: data[0].data, routes: data[1].data };
  }
);

export const deleteWaypoint = createAsyncThunk(
  'point/deleteWaypoint',
  async ({ id, searchParams, expandedPoints }, { dispatch }) => {
    await api.delete(`point/${id}/delete/`);
    await dispatch(fetchWaypointsAndDirections(searchParams));
    expandedPoints.forEach(id => {
      dispatch(fetchPointDirectionsAndRoutes(id));
    });
  }
);

export const fetchDirections = createAsyncThunk('direction/fetchDirections', async searchParams => {
  return (await api(`direction/full/?${searchParams}`)).data;
});

export const fetchPointList = createAsyncThunk('point/fetchPointList', async () => {
  return (await api('point-id-name/')).data;
});

export const fetchDirectionsFilter = createAsyncThunk('point/fetchDirectionsFilter', async () => {
  return (await api('direction-short/')).data;
});

export const createDirection = createAsyncThunk(
  'point/createDirection',
  async (values, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key].id;
      }
      await api.post('direction/create/', body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const updateDirection = createAsyncThunk(
  'point/updateDirection',
  async ({ values, id }, { rejectWithValue }) => {
    try {
      const body = {};
      for (const key in values) {
        if (values[key]) body[key] = values[key].id;
      }
      await api.put(`direction/${id}/update/`, body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const fetchDirectionDetail = createAsyncThunk('point/fetchDirectionDetail', async id => {
  return (await api(`direction/${id}/`)).data;
});

export const deleteDirection = createAsyncThunk(
  'point/deleteDirection',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`direction/${id}/delete/`);
    dispatch(fetchDirections(searchParams));
  }
);

export const createRoute = createAsyncThunk(
  'point/createRoutes',
  async (points, { rejectWithValue }) => {
    try {
      const body = {
        points: points.map(({ point_id }) => point_id.value),
      };
      await api.post('route/create/', body);
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const fetchRouteDetail = createAsyncThunk('point/fetchRouteDetail', async id => {
  return (await api(`route/${id}/`)).data;
});

export const updateRoute = createAsyncThunk(
  'point/updateRoute',
  async ({ points, id, pointsForDelete }, { rejectWithValue }) => {
    const bodyForUpdate = { points: [] };
    const bodyToAdd = [];
    points.forEach(({ point_id, isNew }, index) => {
      if (isNew) {
        bodyToAdd.push({ ordering: index, id: point_id.value });
      } else {
        bodyForUpdate.points.push({ point_id: point_id.value });
      }
    });

    const deletePromises = pointsForDelete.map(pointId =>
      api.delete(`route/${id}/point/${pointId}/delete/`)
    );
    await Promise.all(deletePromises);

    try {
      await api.put(`route/${id}/update/`, {
        points: bodyForUpdate.points.map((item, index) => ({ ...item, ordering: index })),
      });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }

    const errors = {};
    const addPoint = async (index, body) => {
      if (index > bodyToAdd.length - 1) return;
      await uninterceptedAxiosInstance
        .post(`route/${id}/point/add/`, body)
        .catch(({ response }) => {
          errors[
            `points[${points.findIndex(
              ({ point_id, isNew }) => point_id.value === body.id && !!isNew
            )}].point_id`
          ] = response.data.detail;
        });
      await addPoint(index + 1, bodyToAdd[index + 1]);
    };
    await addPoint(0, bodyToAdd[0]);
    if (Object.keys(errors).length) return rejectWithValue(errors);
  }
);

export const fetchRoutes = createAsyncThunk('point/fetchRoutes', async searchParams => {
  return (await api(`route/?${searchParams}`)).data;
});

export const fetchFilterRoutes = createAsyncThunk('point/fetchFilterRoutes', async () => {
  return (await api('route-short/')).data;
});

export const deleteRoute = createAsyncThunk(
  'point/deleteRoute',
  async ({ id, searchParams }, { dispatch }) => {
    await api.delete(`route/${id}/delete/`);
    await Promise.all([dispatch(fetchRoutes(searchParams)), dispatch(fetchFilterRoutes())]);
  }
);

export const fetchTransportationTariffs = createAsyncThunk(
  'tariff/fetchTransportationTariffs',
  async searchParams => {
    const { data } = await api(
      `transportation-tariff/direction-transportation-type/?${searchParams}`
    );

    return {
      ...data,
      direction: { id: Number(searchParams.split('=').pop()) },
    };
  }
);

export const createRoutePointLimitation = createAsyncThunk(
  'point/createRoutePointLimitation',
  async ({ route, point, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/route-point/create/`, { rule, route: route.id, point: point.id });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createStatusLimitation = createAsyncThunk(
  'point/createStatusLimitation',
  async ({ status, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/loading-list-status/create/`, { rule, status: status.id });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createTransportationTypeLimitation = createAsyncThunk(
  'point/createTransportationTypeLimitation',
  async ({ transportation_type, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/transportation-type/create/`, {
        rule,
        transportation_type: transportation_type.value,
      });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createContractTypeLimitation = createAsyncThunk(
  'point/createContractTypeLimitation',
  async ({ contract_type, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/contract-type/create/`, {
        rule,
        contract_type: contract_type.id,
      });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createEmployeeLimitation = createAsyncThunk(
  'point/createEmployeeLimitation',
  async ({ worker, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/worker/create/`, { rule, worker: worker.id });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createContainerLimitation = createAsyncThunk(
  'point/createContainerLimitation',
  async ({ has_container, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/container/create/`, { rule, has_container });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createDocTypeLimitation = createAsyncThunk(
  'point/createDocTypeLimitation',
  async ({ doc_type, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/document-type/create/`, {
        rule,
        doc_type: doc_type.id,
      });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);

export const createEmptyLimitation = createAsyncThunk(
  'point/createEmptyLimitation',
  async ({ name, rule }, { rejectWithValue }) => {
    try {
      await api.post(`rule/void/create/`, { rule, name });
    } catch (e) {
      return rejectWithValue(e.response.data.field_errors || {});
    }
  }
);
