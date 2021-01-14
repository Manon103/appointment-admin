import router from './router'
import {systemRouterMap, doctorRouterMap,constantRouterMap} from "./router";

export function getPermission() {

  if (sessionStorage.getItem('username') === 'admin' ) {
    let array = constantRouterMap.concat(systemRouterMap);
    router.options.routes = array;
    router.onReady(() => {

      router.addRoutes(array)
    });
  } else {
    let array = constantRouterMap.concat(doctorRouterMap);
    router.options.routes = array;
    router.addRoutes(array)
  }

}
