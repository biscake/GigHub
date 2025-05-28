import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { AuthProvider } from "./context/AuthProvider";
import "./styles/App.css";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>GigHub</title>
        <link rel="icon" type="image/svg+xml" href="/GigHub_favicon.png" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={process.env.NODE_ENV !== 'production'}>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
