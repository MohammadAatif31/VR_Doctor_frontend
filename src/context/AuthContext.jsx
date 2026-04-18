/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

// ⭐ context create
export const AuthContext = createContext();

// ⭐ PROVIDER
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // ⭐ AUTO SESSION CHECK (PAGE REFRESH PE LOGIN NA MANGE)
  // ================================
  const checkAuth = async () => {
    try {
      const res = await API.get("/auth/refresh",{
        withCredentials: true,
        skipLoader: true
    
      });

      // agar backend user bheje
      setUser({...res.data.user,
        photo: res.data.user.photo || ""
      });

    } catch (err) {
      console.log(err)
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ================================
  // ⭐ LOGIN
  // ================================
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    setUser({ ...res.data.user,
      photo: res.data.user.photo || ""
      });
  };

  // ================================
  // ⭐ REGISTER
  // ================================
  const register = async (name, email, password) => {
  const res = await API.post("/auth/register", {
    name,
    email,
    password
  });

  // ⭐ set user after register
  setUser({ ...res.data.user,
    photo: ""
   });
};

  // ================================
  // ⭐ LOGOUT
  // ================================
  const logout = async () => {
    await API.post("/auth/logout");
    setUser(null);
  };

  // ================================
// ⭐ UPDATE USER (PROFILE SAVE KE BAAD SIDEBAR UPDATE)
// ================================
const updateUser = (newData) => {
  setUser((prev) => ({
    ...prev,
    ...newData,
  }));
};

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ================================
// ⭐ VERY IMPORTANT (YOUR ERROR FIX)
// ================================
export const useAuth = () => useContext(AuthContext);