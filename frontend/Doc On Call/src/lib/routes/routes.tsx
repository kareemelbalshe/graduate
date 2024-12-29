/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import NotFound from "../../pages/notFound/NotFound";
const Chatbot = lazy(() => import("../../pages/chatbot/Chatbot"));

export const routes = createBrowserRouter([
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "chatbot",
        element: <Chatbot />,
      },
    ],
  },
]);
