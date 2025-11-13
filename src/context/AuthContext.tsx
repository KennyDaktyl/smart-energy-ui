import { createContext, useEffect, ReactNode, useState } from "react";
import { authApi } from "../api/authApi";

interface AuthContextProps {
  user: any;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: localStorage.getItem("token"),
    loading: true,
  });

  const login = (jwt: string) => {
    localStorage.setItem("token", jwt);
    setAuthState((prev) => ({ ...prev, token: jwt }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ user: null, token: null, loading: false });
  };

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (!authState.token) {
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const res = await authApi.getMe(authState.token);
        if (!cancelled) {
          setAuthState({
            user: res.data,
            token: authState.token,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) logout();
      }
    };

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [authState.token]);

  if (authState.loading) {
    return <div>Ładowanie danych użytkownika...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        login,
        logout,
        loading: authState.loading,
        isAuthenticated: !!authState.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
