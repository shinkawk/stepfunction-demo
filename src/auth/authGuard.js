import store from '../store'

export const authGuard = async (to, from, next) => {
  await store.dispatch('created');
  const authService = store.state.auth0Client;

    const fn = () => {
      // If the user is authenticated, continue with the route
      if (authService.isAuthenticated) {
        return next();
      }
  
      // Otherwise, log in
      authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
    };
  
    // If loading has already finished, check our auth state using `fn()`
    if (!store.getIsLoading) {
      return fn();
    }
    store.watch(store.getters.getIsLoading, (isLoading) => {
      if (isLoading)
      return fn();
    })
};