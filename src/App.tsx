import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MyInstallationsPage from "./pages/user/MyInstallationsPage";
import UsersListPage from "./pages/admin/UsersListPage";
import AppHeader from "./components/Layout/AppHeader";
import DevicesPage from "./pages/user/DevicesPage";
import HuaweiPage from "./pages/user/HuaweiPage";
import AccountPage from "./pages/user/AccountPage";

export default function App() {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return <div>Ładowanie danych użytkownika...</div>;
  }

  return (
    <>
    <AppHeader />
      <Routes>
        {/* publiczne strony */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* przekierowanie główne */}
        <Route
          path="/"
          element={
            auth?.token ? (
              <Navigate
                to={auth?.user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* dashboard użytkownika */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MyInstallationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DevicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/huawei"
          element={
            <ProtectedRoute>
              <HuaweiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        {/* panel admina */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <UsersListPage />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
