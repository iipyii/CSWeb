import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('csweb_token'));

  // ตั้งค่า Axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.withCredentials = true;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // ตรวจสอบ Token และดึงข้อมูลผู้ใช้ปัจจุบัน
  const fetchCurrentUser = async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await axios.get('http://localhost:5000/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
        withCredentials: true
      });
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to verify token:', err.response?.data || err.message);
      // ถ้า Token หมดอายุ ให้เคลียร์ออก
      localStorage.removeItem('csweb_token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ฟังก์ชัน Login ด้วย Token จาก SSO
  const loginWithToken = async (newToken) => {
    setLoading(true);
    localStorage.setItem('csweb_token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    const userData = await fetchCurrentUser(newToken);
    return userData;
  };

  // ฟังก์ชัน Logout
  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('csweb_token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/admin/login';
    }
  };

  const value = {
    user,
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    isLecturer: user?.role === 'lecturer',
    isAuthenticated: !!user,
    loading,
    token,
    loginWithToken,
    logout,
    refreshUser: () => fetchCurrentUser()
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
