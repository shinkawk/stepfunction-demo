import createAuth0Client from "@auth0/auth0-spa-js";
import { domain, clientId } from "../../../auth_config.json";

import { Auth } from 'aws-amplify';

const DEFAULT_REDIRECT_CALLBACK = () =>
    window.history.replaceState({}, document.title, window.location.pathname);

export default ({
    // the state
    state: {
        user: {},
        auth0Client: null,
        error: null,
        token: null,
        domain,
        clientId,
    },
    // tells you something more complicated about the state (or readonly view of the state)
    getters: {
        getUser: state => { return state.user },
        getClient: state => { return state.auth0Client },
        getIsAuthenticated: state => { return state.token != null },
        getIsLoading: state => { return state.auth0Client == null },
    },
    // updates the state
    mutations: {
        setUser: (state, user) => {
            state.user = user;
        },
        setToken: (state, token) => {
            state.token = token;
        },
        setClient: (state, client) => {
            state.auth0Client = client;
        },
    },
    // how you do something complicated (maybe async) that eventually updates the state via mutations (using commit)
    actions: {
        async loginWithPopup(o) {
            this.popupOpen = true;

            try {
                await this.auth0Client.loginWithPopup(o);
            } catch (e) {
                // eslint-disable-next-line
                console.error(e);
            } finally {
                this.popupOpen = false;
            }

            const user = await this.auth0Client.getUser();
            this.$store.commit('setUser', user);
        },
        /** Handles the callback when logging in using a redirect */
        async handleRedirectCallback() {
            this.loading = true;
            try {
                await this.auth0Client.handleRedirectCallback();
                const user = await this.auth0Client.getUser();
                this.$store.commit('setUser', user);
            } catch (e) {
                this.error = e;
            } finally {
                this.loading = false;
            }
        },
        /** Authenticates the user using the redirect method */
        async loginWithRedirect({ state }, o) {
            return state.auth0Client.loginWithRedirect(o);
        },
        /** Returns all the claims present in the ID token */
        getIdTokenClaims(o) {
            return this.auth0Client.getIdTokenClaims(o);
        },
        /** Returns the access token. If the token is invalid or missing, a new one is retrieved */
        getTokenSilently(o) {
            return this.auth0Client.getTokenSilently(o);
        },
        /** Gets the access token using a popup window */

        getTokenWithPopup(o) {
            return this.auth0Client.getTokenWithPopup(o);
        },
        /** Logs the user out and removes their session on the authorization server */
        logout({ state }) {
            return state.auth0Client.logout({ returnTo: window.location.origin });
        },
        async created(context) {
            // eslint-disable-next-line
            console.log("Init auth.js");
            // Create a new instance of the SDK client using members of the given options object
            let auth0Client = null;
            if (context.state.auth0Client == null) {
                auth0Client = await createAuth0Client({
                    domain: domain,
                    client_id: clientId,
                    // audience: options.audience,
                    redirect_uri: window.location.origin,
                    onRedirectCallback: DEFAULT_REDIRECT_CALLBACK,
                });

                // eslint-disable-next-line
                console.log(auth0Client);
                context.commit("setClient", auth0Client)
            }
            try {
                // If the user is returning to the app after authentication..
                if (
                    window.location.search.includes("code=") &&
                    window.location.search.includes("state=")
                ) {
                    // handle the redirect and retrieve tokens
                    const { appState } = await context.state.auth0Client.handleRedirectCallback();
                    // Notify subscribers that the redirect callback has happened, passing the appState
                    // (useful for retrieving any pre-authentication state)
                    DEFAULT_REDIRECT_CALLBACK(appState);
                }
            } catch (e) {
                // eslint-disable-next-line
                console.error(e);
            } finally {
                let authenticated = await context.state.auth0Client.isAuthenticated()
                if (authenticated) {
                    const user = await context.state.auth0Client.getUser();
                    context.commit('setUser', user);
                    const token = await context.state.auth0Client.getTokenSilently();
                    context.commit('setToken', token);
                    let idToken = await context.state.auth0Client.getIdTokenClaims()
                     // eslint-disable-next-line
                     console.log(idToken.__raw)
                    Auth.federatedSignIn(
                        domain,
                        {
                            token: idToken.__raw,
                            //identity_id, // Optional
                            expires_at: context.state.auth0Client.cache.cache.expiresIn * 1000 + new Date().getTime() // the expiration timestamp
                        },
                        user
                    ).then(cred => {
                        // If success, you will get the AWS credentials
                        // eslint-disable-next-line
                        console.log(cred);
                        return Auth.currentAuthenticatedUser();
                    }).then(user => {
                        // If success, the user object you passed in Auth.federatedSignIn
                        // eslint-disable-next-line
                        console.log(user);
                    }).catch(e => {
                        // eslint-disable-next-line
                        console.log(e)
                    });
                    Auth.currentAuthenticatedUser().then(user => 
                        // eslint-disable-next-line
                        console.log(user));
                    Auth.currentCredentials().then(creds => 
                        // eslint-disable-next-line
                        console.log(creds));
                }
            }
            // eslint-disable-next-line
            console.log("auth.js init completed");
            return await context.state.auth0Client;
        },
    },
});