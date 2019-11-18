import createAuth0Client from "@auth0/auth0-spa-js";
import { domain, clientId } from "../../../auth_config.json";

const DEFAULT_REDIRECT_CALLBACK = () =>
    window.history.replaceState({}, document.title, window.location.pathname);

export default {
    // the state
    state: {
        instance: null,
        loading: true,
        isAuthenticated: false,
        user: {},
        auth0Client: null,
        error: null,
        token: null,
        domain,
        clientId,
    },
    // tells you something more complicated about the state (or readonly view of the state)
    getters: {
        getIsAuthenticated: (state) => state.token !== null,
    },
    // updates the state
    mutations: {
        setUser(user) {
            this.user = user;
            this.isAuthenticated = true;
        },
        setToken(token) {
            this.token = token;
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
        loginWithRedirect(o) {
            return this.auth0Client.loginWithRedirect(o);
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
        logout(o) {
            return this.auth0Client.logout(o);
        },
        async created() {
            // Create a new instance of the SDK client using members of the given options object
            this.auth0Client = await createAuth0Client({
                domain: this.domain,
                client_id: this.clientId,
                // audience: options.audience,
                redirect_uri: window.location.origin,
                onRedirectCallback: DEFAULT_REDIRECT_CALLBACK,
            });

            try {
                // If the user is returning to the app after authentication..
                if (
                    window.location.search.includes("code=") &&
                    window.location.search.includes("state=")
                ) {
                    // handle the redirect and retrieve tokens
                    const { appState } = await this.auth0Client.handleRedirectCallback();

                    // Notify subscribers that the redirect callback has happened, passing the appState
                    // (useful for retrieving any pre-authentication state)
                    DEFAULT_REDIRECT_CALLBACK(appState);
                }
            } catch (e) {
                this.error = e;
            } finally {
                // Initialize our internal authentication state
                this.isAuthenticated = await this.auth0Client.isAuthenticated();

                const user = await this.auth0Client.getUser();
                this.$store.commit('setUser', user);

                this.loading = false;
                const token = await this.auth0Client.getTokenSilently();
                this.$store.commit('setToken', token);

                // eslint-disable-next-line
                console.log(this.token);
                // eslint-disable-next-line
                console.log(this.auth0Client);
                // eslint-disable-next-line
                console.log(this.auth0Client.cache);
            }
        }
    },
}