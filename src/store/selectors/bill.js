export const selectOrigin = (state, actType, { actId, cargoId }, isExtra = false) => {
  const places = isExtra ? 'extraPlaces' : 'places';

  const act = state[places][actType].goods_acceptance_list.find(
    ({ goods_acceptance_id }) => goods_acceptance_id === actId
  );

  if (!act) return [null, null];

  const cargo = act.goods_list.find(({ goods_id }) => goods_id === cargoId);
  return [act, cargo];
};
