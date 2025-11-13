import { Navigate } from "react-router-dom";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MyInstallationsPage from "./pages/user/MyInstallationsPage";
import UsersListPage from "./pages/admin/UsersListPage";
import { AuthContextProps } from "./context/AuthContext";

const routes = (auth: AuthContextProps | null) => [
  {
    path: "/",
    element: <Navigate to={auth?.user?.role === "ADMIN" ? "/admin" : "/dashboard"} replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <MyInstallationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <UsersListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
