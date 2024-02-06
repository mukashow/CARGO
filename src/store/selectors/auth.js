export const selectNavigationByRole = state => {
  const user = state.auth.navigation.find(({ id }) => {
    return id === Number(state.auth.user.role_id);
  });

  if (user) return user.navigation;
  return [];
};
