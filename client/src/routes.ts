import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/AppLayout.tsx", [
    index("components/Dashboard.tsx"),
  ]),
  
  layout("layouts/AccountsLayout.tsx", [
    route("accounts/login", "pages/accounts/LoginPage.tsx"),
    route("accounts/signup", "pages/accounts/SignupPage.tsx"),
    route("accounts/request-reset", "pages/accounts/ResetRequestPage.tsx"),
    route("accounts/reset-password", "pages/accounts/ResetPasswordPage.tsx"),
  ]),
] satisfies RouteConfig;
