import home from "./components/home.js";
import CreateUser from "./components/register.js";
import Login from "./components/login.js";
import Profile from "./components/profile.js";

const router = new VueRouter({
  routes: [
    { path: "/", name: "home", component: home },
    { path: "/register", name: "register", component: CreateUser },
    { path: "/login", name: "login", component: Login },
    { path: "/profile", name: "profile", component: Profile },
  ],
});

export default router;
