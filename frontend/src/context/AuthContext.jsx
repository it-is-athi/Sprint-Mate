import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { 
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear chat storage on logout
    if (user) {
      localStorage.removeItem(`sprintmate_chat_${user.id}_general`);
      localStorage.removeItem(`sprintmate_chat_${user.id}_pdf`);
      localStorage.removeItem(`sprintmate_pdf_name_${user.id}`);
    }
    
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}