import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .getCurrentUser()
        .then((res) => {
          const userData = res?.data;
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const tokenData = res?.data;
    if (!tokenData?.access_token) {
      throw new Error('Login failed: no token received');
    }
    localStorage.setItem('token', tokenData.access_token);
    localStorage.setItem('refresh_token', tokenData.refresh_token);

    const userRes = await authService.getCurrentUser();
    const userData = userRes?.data;
    if (userData) {
      setUser(userData);
    }

    return tokenData;
  };

  const register = async (email, password, first_name, last_name) => {
    const res = await authService.register(email, password, first_name, last_name);
    const registeredUser = res?.data;

    const loginRes = await authService.login(email, password);
    const tokenData = loginRes?.data;
    if (tokenData?.access_token) {
      localStorage.setItem('token', tokenData.access_token);
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }

    const userRes = await authService.getCurrentUser();
    const userData = userRes?.data;
    if (userData) {
      setUser(userData);
    }

    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
