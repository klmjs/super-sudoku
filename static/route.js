const {createWebHashHistory, createRouter} = VueRouter;

import Game from "./pages/Game.js";
import SelectGame from "./pages/SelectGame.js";

const routes = [
  {path: "/", component: Game},
  {path: "/select-game", component: SelectGame},
  {path: "/:pathMatch(.*)*", component: Game},
];

const route = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default route;
