<template>
  <div class="home">
    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="!loading">
      <!-- show login when not authenticated -->
      <v-btn v-if="!isAuthenticated" @click="loginWithRedirect">Log in</v-btn>
      <!-- show logout when authenticated -->
      <v-btn v-if="isAuthenticated" @click="logout">Log out</v-btn>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapState, mapActions } from 'vuex';

export default {
  name: 'home',
  computed: {
    ...mapState([
      'loading',
      'isAuthenticated',
    ]),
  },
  methods: {
    ...mapActions([
      'loginWithRedirect',
    ]),
    // Log the user in
    // login() {
    //   this.$store.dispatch('loginWithRedirect');
    // },
    // Log the user out
    logout() {
      // this.store.dispatch().logout({
      //   returnTo: window.location.origin
      // });
    }
  },
  created() {
    this.$store.dispatch('created');
  }
}
</script>
