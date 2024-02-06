import { createSlice, current } from '@reduxjs/toolkit';
import { selectOrigin } from '@selectors/bill';
import { fetchGoodsForBillAdding, fetchPlacesForAddingToBill } from '@actions';

const initialState = {
  goodsToAdd: null,
  placesToAdd: null,
  places: {
    adds: {
      goods_acceptance_list: [],
      addsMemory: [],
      removalAddsMemory: [],
    },
    deletes: {
      goods_acceptance_list: [],
      deletesMemory: [],
      removalDeletesMemory: [],
    },
  },
  extraPlaces: {
    adds: {
      goods_acceptance_list: [],
      addsMemory: [],
      removalAddsMemory: [],
    },
    deletes: {
      goods_acceptance_list: [],
      deletesMemory: [],
      removalDeletesMemory: [],
    },
  },
};

export const bill = createSlice({
  name: 'bill',
  initialState,
  selectors: {},
  reducers: {
    setPlaceToAddsMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].adds.addsMemory.push(id);
    },
    deletePlaceFromAddsMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].adds.addsMemory = state.places.adds.addsMemory.filter(
        placeId => placeId !== id
      );
    },
    setPlaceToAddsRemovalMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].adds.removalAddsMemory.push(id);
    },
    deletePlaceFromAddsRemovalMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].adds.removalAddsMemory = state.places.adds.removalAddsMemory.filter(
        placeId => placeId !== id
      );
    },
    setPlaceToDeletesMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].deletes.deletesMemory.push(id);
    },
    deletePlaceFromDeletesMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].deletes.deletesMemory = state.places.deletes.deletesMemory.filter(
        placeId => placeId !== id
      );
    },
    setPlaceToDeletesRemovalMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].deletes.removalDeletesMemory.push(id);
    },
    deletePlaceFromDeletesRemovalMemory: (state, { payload }) => {
      const { id, isExtra } = payload;
      const places = isExtra ? 'extraPlaces' : 'places';
      state[places].deletes.removalDeletesMemory = state.places.deletes.removalDeletesMemory.filter(
        placesId => placesId !== id
      );
    },
    setMemoryPlacesToList: (state, { payload }) => {
      const { cargoId, actId, isExtra } = state.placesToAdd;
      const [act, cargo] = selectOrigin(state, payload.type, { actId, cargoId }, isExtra);
      const memoryType = payload.type === 'adds' ? 'addsMemory' : 'deletesMemory';
      const places = isExtra ? 'extraPlaces' : 'places';
      const newCargo = {
        goods_id: cargoId,
        place_id_list: state[places][payload.type][memoryType],
      };

      if (!state[places][payload.type][memoryType].length) return;

      if (!act) {
        state[places][payload.type].goods_acceptance_list.push({
          goods_acceptance_id: actId,
          goods_list: [newCargo],
        });
        return;
      }

      if (!cargo) {
        act.goods_list.push(newCargo);
        return;
      }

      cargo.place_id_list.push(...newCargo.place_id_list);
    },
    setPlaceToList: (state, { payload }) => {
      const { id, actId, cargoId, type, isExtra } = payload;
      const [act, cargo] = selectOrigin(state, type, { actId, cargoId }, isExtra);
      const places = isExtra ? 'extraPlaces' : 'places';

      if (!act) {
        state[places][type].goods_acceptance_list.push({
          goods_acceptance_id: actId,
          goods_list: [{ goods_id: cargoId, place_id_list: [id] }],
        });
        return;
      }

      if (!cargo) {
        act.goods_list.push({ goods_id: cargoId, place_id_list: [id] });
        return;
      }

      cargo.place_id_list.push(id);
    },
    removePlacesFromList: (state, { payload }) => {
      const { cargoId, actId, isExtra } = state.placesToAdd;
      const cargo = selectOrigin(state, payload.type, { actId, cargoId }, isExtra)[1];
      const memoryType = payload.type === 'adds' ? 'removalAddsMemory' : 'removalDeletesMemory';
      const places = isExtra ? 'extraPlaces' : 'places';
      const removalPlaces = state[places][payload.type][memoryType];

      if (!removalPlaces.length) return;

      cargo.place_id_list = cargo.place_id_list.filter(id => !removalPlaces.includes(id));
    },
    removePlaceFromList: (state, { payload }) => {
      const { id, actId, cargoId, type, isExtra } = payload;
      const cargo = selectOrigin(state, type, { actId, cargoId }, isExtra)[1];
      cargo.place_id_list = cargo.place_id_list.filter(place => place !== id);
    },
    clearMemories: state => {
      state.places.adds.addsMemory = [];
      state.places.adds.removalAddsMemory = [];
      state.places.deletes.deletesMemory = [];
      state.places.deletes.removalDeletesMemory = [];
      state.extraPlaces.adds.addsMemory = [];
      state.extraPlaces.adds.removalAddsMemory = [];
      state.extraPlaces.deletes.deletesMemory = [];
      state.extraPlaces.deletes.removalDeletesMemory = [];
    },
    setIsPlaceInList: (state, { payload }) => {
      const { id, actId, cargoId, isExtra } = payload;
      const addsCargo = selectOrigin(state, 'adds', { actId, cargoId }, isExtra)[1];
      const deletesCargo = selectOrigin(state, 'deletes', { actId, cargoId }, isExtra)[1];
      const places = isExtra ? 'extraPlaces' : 'places';

      const isInAddsMemory = state[places].adds.addsMemory.includes(id);
      const isInRemovalAddsMemory = state[places].adds.removalAddsMemory.includes(id);
      const isInAdds = !!addsCargo?.place_id_list?.includes(id);
      const isInDeletesMemory = state[places].deletes.deletesMemory.includes(id);
      const isInDeletesRemovalMemory = state[places].deletes.removalDeletesMemory.includes(id);
      const isInDeletes = !!deletesCargo?.place_id_list?.includes(id);

      const place = state.placesToAdd.place_list.find(({ place_id }) => place_id === id);
      let isChecked = place.is_added;

      if (!isChecked) {
        if (isInAdds || isInAddsMemory) {
          isChecked = true;
        }
        if (isInAdds && isInRemovalAddsMemory) {
          isChecked = false;
        }
      } else {
        if (isInDeletes || isInDeletesMemory) {
          isChecked = false;
        }
        if (isInDeletes && isInDeletesRemovalMemory) {
          isChecked = true;
        }
      }

      place.isChecked = isChecked;
      place.isInAddsMemory = isInAddsMemory;
      place.isInRemovalAddsMemory = isInRemovalAddsMemory;
      place.isInAdds = isInAdds;
      place.isInDeletesMemory = isInDeletesMemory;
      place.isInDeletesRemovalMemory = isInDeletesRemovalMemory;
      place.isInDeletes = isInDeletes;
    },

    setGoodsSelectedPlaceCount: (state, { payload }) => {
      const { actId, cargoId, isExtra } = payload;
      const addsCargoNumber =
        selectOrigin(state, 'adds', payload, isExtra)[1]?.place_id_list.length || 0;
      const deletesCargoNumber =
        selectOrigin(state, 'deletes', payload, isExtra)[1]?.place_id_list.length || 0;

      state.goodsToAdd?.goods_acceptance_list.forEach(({ id, goods_list }) => {
        if (id !== actId) return;
        const cargo = goods_list.find(({ id }) => id === cargoId);
        cargo.selectedPlacesCount = addsCargoNumber + cargo.added_place_count - deletesCargoNumber;
      });
    },
    setPlacesToCargo: (state, { payload }) => {
      const { actId, cargoId, places, isExtra } = payload;
      const [addsAct, addsCargo] = selectOrigin(state, 'adds', { actId, cargoId }, isExtra);
      const cargoDeletes = selectOrigin(state, 'deletes', { actId, cargoId }, isExtra)[1];
      const placesType = isExtra ? 'extraPlaces' : 'places';

      const placesToRemoveFromDeletes = places
        .filter(({ is_added, place_id }) => {
          return is_added && !!cargoDeletes?.place_id_list.includes(place_id);
        })
        .map(({ place_id }) => place_id);

      if (placesToRemoveFromDeletes.length) {
        cargoDeletes.place_id_list = cargoDeletes.place_id_list.filter(
          id => !placesToRemoveFromDeletes.includes(id)
        );
      }

      const placesToAddToAdds = places
        .filter(({ places_id, is_added }) => {
          return !addsCargo?.place_id_list.includes(places_id) && !is_added;
        })
        .map(({ place_id }) => place_id);

      if (!placesToAddToAdds.length) return;

      if (!addsAct) {
        state[placesType].adds.goods_acceptance_list.push({
          goods_acceptance_id: actId,
          goods_list: [{ goods_id: cargoId, place_id_list: placesToAddToAdds }],
        });
        return;
      }

      if (!addsCargo) {
        addsAct.goods_list.push({ goods_id: cargoId, place_id_list: placesToAddToAdds });
        return;
      }

      addsCargo.place_id_list.push(...placesToAddToAdds);
    },
    deletePlacesFromCargo: (state, { payload }) => {
      const { actId, cargoId, places, isExtra } = payload;
      const [actDeletes, cargoDeletes] = selectOrigin(
        state,
        'deletes',
        { actId, cargoId },
        isExtra
      );
      const cargoAdds = selectOrigin(state, 'adds', { actId, cargoId }, isExtra)[1];
      const placesType = isExtra ? 'extraPlaces' : 'places';

      const placesToRemoveFromAdds = places
        .filter(({ place_id }) => {
          return !!cargoAdds?.place_id_list.includes(place_id);
        })
        .map(({ place_id }) => place_id);

      if (!!placesToRemoveFromAdds.length && !!cargoAdds) {
        cargoAdds.place_id_list = cargoAdds.place_id_list.filter(
          id => !placesToRemoveFromAdds.includes(id)
        );
      }

      const placesToAddToDeletes = places
        .filter(({ place_id, is_added }) => {
          return is_added && !cargoDeletes?.place_id_list.includes(place_id);
        })
        .map(({ place_id }) => place_id);

      if (!placesToAddToDeletes.length) return;

      if (!actDeletes) {
        state[placesType].deletes.goods_acceptance_list.push({
          goods_acceptance_id: actId,
          goods_list: [{ goods_id: cargoId, place_id_list: placesToAddToDeletes }],
        });
        return;
      }
      if (!cargoDeletes) {
        actDeletes.goods_list.push({ goods_id: cargoId, place_id_list: placesToAddToDeletes });
        return;
      }
      cargoDeletes.place_id_list.push(...placesToAddToDeletes);
    },

    setActsPlacesCount: (state, { payload }) => {
      const { id, isExtra } = payload;
      const act = state.goodsToAdd.goods_acceptance_list.find(item => item.id === id);
      const defaultSelectedPlaces = act.goods_list.reduce(
        (total, el) => total + el.added_place_count,
        0
      );
      const places = isExtra ? 'extraPlaces' : 'places';

      const selectActsPlaces = (state, actId, type) => {
        const act = state[places][type].goods_acceptance_list.find(
          ({ goods_acceptance_id }) => goods_acceptance_id === actId
        );
        if (!act) return 0;
        return act.goods_list.reduce((total, el) => {
          return total + el.place_id_list.length;
        }, 0);
      };
      const addsPlaces = selectActsPlaces(state, id, 'adds');
      const deletesPlaces = selectActsPlaces(state, id, 'deletes');
      act.selectedPlacesCount = addsPlaces + defaultSelectedPlaces - deletesPlaces;
    },

    clearPlaces: state => {
      state.places = initialState.places;
      state.extraPlaces = initialState.extraPlaces;
    },
  },
  extraReducers: {
    [fetchGoodsForBillAdding.fulfilled]: (state, { payload }) => {
      state.goodsToAdd = payload;
    },
    [fetchPlacesForAddingToBill.fulfilled]: (state, { payload }) => {
      state.placesToAdd = payload;
    },
  },
});

export const {
  setIsPlaceInList,
  setPlaceToAddsRemovalMemory,
  setPlaceToDeletesRemovalMemory,
  setPlaceToDeletesMemory,
  setPlaceToAddsMemory,
  deletePlaceFromAddsMemory,
  setMemoryPlacesToList,
  clearMemories,
  deletePlaceFromDeletesMemory,
  removePlacesFromList,
  deletePlaceFromAddsRemovalMemory,
  deletePlaceFromDeletesRemovalMemory,
  setGoodsSelectedPlaceCount,
  setPlacesToCargo,
  deletePlacesFromCargo,
  removePlaceFromList,
  setPlaceToList,
  setActsPlacesCount,
  clearPlaces,
} = bill.actions;

export default bill.reducer;
