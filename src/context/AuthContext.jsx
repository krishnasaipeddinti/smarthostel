import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMeApi, loginApi, registerApi } from "../services/authApi";
import { KEYS, removeStorageData, setStorageData } from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncCurrentUser = (userData) => {
    if (userData) {
      setStorageData(KEYS.CURRENT_USER, userData);
    } else {
      removeStorageData(KEYS.CURRENT_USER);
    }
  };

  const loadUserFromToken = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      syncCurrentUser(null);
      return null;
    }

    try {
      const me = await getMeApi();
      setUser(me);
      syncCurrentUser(me);
      return me;
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      syncCurrentUser(null);
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await loadUserFromToken();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (formData) => {
    const data = await loginApi(formData);

    localStorage.setItem("token", data.token);
    setUser(data);
    syncCurrentUser(data);

    return data;
  };

  const signup = async (formData) => {
    const data = await registerApi(formData);

    localStorage.setItem("token", data.token);
    setUser(data);
    syncCurrentUser(data);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    syncCurrentUser(null);
  };

  const refreshUser = async () => {
    try {
      const latestUser = await loadUserFromToken();
      return latestUser;
    } catch (error) {
      console.error("Refresh user failed:", error);
      return null;
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);