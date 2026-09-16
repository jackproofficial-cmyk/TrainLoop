import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  // Multi-tab logout sync listener
  useEffect(()=>{
    const syncLogout = (e)=>{
      if(e.key === 'isLoggedIn' && !e.newValue) {
        setUser(null)
        setUserProfile(null)
      } 

      window.addEventListener('storage', syncLogout)
      return ()=> window.removeEventListener('storage', syncLogout)
    }
  }, [])

  const checkAuth = async () => {
    // Check for the client-side session hint before requesting
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      setUser(null);
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [userRes, profileRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/profile')
      ]);
      setUser(userRes.data);
      setUserProfile(profileRes.data?.profile || profileRes.data);
    } catch (err) {
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    checkAuth(); 
  }, []);

  const login = async (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    setUser(userData);
    await checkAuth();
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (err) {
      console.error("Logout Error :", err);
    } finally {
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setUserProfile(null);
    }
  };

  const resetProfile = async () => {
    try {
      await api.delete('/users/profile');
      await checkAuth();
    } catch (err) {
      console.error("Failed to reset profile:", err);
    }
  };

  const isProfileComplete = Boolean(
    userProfile?.metrics?.MHR || userProfile?.profile?.metrics?.MHR
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        setUserProfile,
        isProfileComplete,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        resetProfile,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);