import React, {  } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { ProtectedRoute  } from "../routes/ProtectedRoute"

import Login from "../components/Login"
import ProtectedPage from "../components/Protected";
import Home from "../components/Home";

const Routes = () => {
//   const [apiData, setApiData] = useState([]);
  const { token } = useAuth();

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: "/service",
      element: <div>Service Page</div>,
    },
  ];

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: "",
          element: <div>User Home Page</div>,
        },
        {
          path: "/protected",
          element: <ProtectedPage />,
        },
        {
          path: "/logout",
          element: <div>Logout</div>,
        },
      ],
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [

    {
      path: "/login",
      element: <Login />
    },
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;
