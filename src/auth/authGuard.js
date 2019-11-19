import store from '../store'

export const authGuard = async (to, from, next) => {
  const authService = await store.dispatch('created');
  // eslint-disable-next-line
  console.log("After created");
  // eslint-disable-next-line
  console.log(authService);

    const fn = () => {
      // If the user is authenticated, continue with the route
      if (store.getters.getIsAuthenticated) {
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
      if (!isLoading)
      return fn();
    })
};