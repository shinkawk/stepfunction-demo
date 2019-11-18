import Vue from "vue";
import App from "./App.vue";
import router from './router'
import vuetify from '@/plugins/vuetify' // path to vuetify export
import createAuth0Client from "@auth0/auth0-spa-js";

// Import the Auth0 configuration
import { domain, clientId } from "../auth_config.json";

import store from './store'

/** Define a default action to perform after authentication */
const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

store.state.instance = await createAuth0Client({
  domain: store.state.domain,
  client_id: store.state.clientId,
  //audience: options.audience,
  redirect_uri: window.location.origin,
  onRedirectCallback: DEFAULT_REDIRECT_CALLBACK
})

store.state.domain = domain;
store.state.clientId = clientId;


new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount("#app");