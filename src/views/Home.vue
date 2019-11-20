<template>
  <div class="home">
    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="!getIsLoading">
      <!-- show login when not authenticated -->
      <v-btn v-if="!getIsAuthenticated" @click="loginWithRedirect">Log in</v-btn>
      <!-- show logout when authenticated -->
      <v-btn v-if="getIsAuthenticated" @click="logout">Log out</v-btn>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapActions, mapGetters } from "vuex";

export default {
  name: "home",
  computed: {
    ...mapGetters(["getIsAuthenticated", "getIsLoading", "getUser"])
  },
  methods: {
    ...mapActions(["loginWithRedirect", "logout"]),
  }
};
</script>
