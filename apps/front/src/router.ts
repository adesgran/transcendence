import {
  NotFoundRoute,
  RootRoute,
  Route,
  Router,
  redirect,
} from "@tanstack/react-router";
import App from "./App";
import Auth from "./auth-pages/Auth";
import Auth2FA from "./auth-pages/Auth2FA/Auth2FA";
import SignUp from "./auth-pages/SignUp/SignUp";
import SignIn from "./auth-pages/SignIn/SignIn";
import PageNotFound from "./PageNotFound";

const rootRoute = new RootRoute();
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    if (!localStorage.getItem("token")) {
      throw redirect({
        to: "/auth",
      });
    } else {
      throw redirect({
        to: "/home",
      });
    }
  },
});

const appRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: App,
  beforeLoad: async () => {
    if (!localStorage.getItem("token")) {
      throw redirect({
        to: "/auth",
      });
    }
  },
});

const authRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: Auth,
});
const authIndexRoute = new Route({
  getParentRoute: () => authRoute,
  path: "/",
  component: SignIn,
});
const authTwoFARoute = new Route({
  getParentRoute: () => authRoute,
  path: "/2fa/$id",
  component: Auth2FA,
});
const authSignUpRoute = new Route({
  getParentRoute: () => authRoute,
  path: "/sign-up",
  component: SignUp,
  beforeLoad: async () => {
    if (localStorage.getItem("token")) {
      throw redirect({
        to: "/auth",
      });
    }
  },
});
const authRedirectRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/redirect/$token",
  beforeLoad: async ({ params }) => {
    if (!!params.token) {
      window.localStorage.setItem("token", params.token);
      throw redirect({
        to: "/home",
      });
    }
  },
});

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: PageNotFound,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute,
  authRoute.addChildren([authIndexRoute, authTwoFARoute, authSignUpRoute]),
  authRedirectRoute,
]);

export const router = new Router({ routeTree, notFoundRoute });

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}
