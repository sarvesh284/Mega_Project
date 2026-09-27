import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authApi from "../api/auth.api.js";
import { getAccessToken, setTokens, clearTokens } from "../api/client.js";
import { primaryRole } from "../api/adapters.js";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUserPayload = (userData, workerProfile, employerProfile) => {
    if (!userData) return null;
    const role = primaryRole(userData);
    const name =
      workerProfile?.fullName ||
      employerProfile?.businessName ||
      userData.fullName ||
      userData.businessName ||
      userData.phone ||
      "User";

    return {
      ...userData,
      role,
      name,
      workerProfile: workerProfile || null,
      employerProfile: employerProfile || null,
    };
  };

  const refreshMe = useCallback(async () => {
    try {
      const data = await authApi.me();
      const formatted = formatUserPayload(
        data?.user,
        data?.workerProfile,
        data?.employerProfile
      );
      setUser(formatted);
      return formatted;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      if (getAccessToken()) {
        await refreshMe();
      }
      setLoading(false);
    };
    boot();
  }, [refreshMe]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      clearTokens();
      setUser(null);
    };
    window.addEventListener("lr:logout", handleLogoutEvent);
    return () => window.removeEventListener("lr:logout", handleLogoutEvent);
  }, []);

  const login = async (phoneOrCredentials, passwordParam) => {
    let payload;
    if (typeof phoneOrCredentials === "object" && phoneOrCredentials !== null) {
      payload = phoneOrCredentials;
    } else {
      payload = { phone: phoneOrCredentials, password: passwordParam };
    }

    const res = await authApi.login(payload);
    if (res?.accessToken && res?.refreshToken) {
      setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    }

    const fullUser = await refreshMe();
    return fullUser || formatUserPayload(res?.user);
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res?.accessToken && res?.refreshToken) {
      setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    }

    const formatted = formatUserPayload(
      res?.user,
      res?.workerProfile,
      res?.employerProfile
    );
    setUser(formatted);
    return formatted;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network/auth errors during logout
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };