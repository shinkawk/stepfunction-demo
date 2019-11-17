import Vue from "vue";
import Router from "vue-router";
import Home from "../views/Home.vue";
import Todo from "../views/Todo.vue";
import { authGuard } from "../auth/authGuard";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/todo",
      name: "todo",
      component: Todo,
      beforeEnter: authGuard
    }
  ]
});
export default router;