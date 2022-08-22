import { createApp } from "vue";
import "./tailwind.css";
import App from "./App.vue";
import { routes, router } from "./routes";
import { createRouter, createWebHistory } from "vue-router";
import applyMiddleware from "./middleware";
import { createPinia } from "pinia";
const app = createApp(App);
const pinia = createPinia();
// console.warn = () => {};
applyMiddleware(router);

app.use(pinia);
app.use(router);
app.mount("#app");
