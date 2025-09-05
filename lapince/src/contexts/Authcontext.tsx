'use client'

import { useEffect } from "react";
import {  useContext } from "react";
import { createContext } from "react";
import { useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import type IUser from "@/@types/user";


type AuthContextType = {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
  fetchUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3001/api/auth/me", {
        withCredentials: true,
      });
    
      
      setUser(res.data.user);
      if (res.data.user) {
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Non authentifié');
        } else {
          setError(err.response?.data?.error || 'Erreur de connexion');
        }
      } else {
        setError('Failed to fetch user');
      }
    } finally {
      setLoading(false);
    }
  };
    
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
  }, [user]);


  const logout = async () => {
    try {
      await axios.post("http://localhost:3001/api/auth/logout", {}, {
        withCredentials: true,
      });
      await fetchUser();
    } catch (err) {
      setError('Failed to logout');
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);