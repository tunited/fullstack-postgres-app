import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('apex_token') || null);
  const [loading, setLoading] = useState(true);

  // Define API Base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Verify token and load fresh user profile
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            // Save/Sync user in localStorage
            localStorage.setItem('apex_user', JSON.stringify(userData));
          } else {
            // Token is invalid/expired
            logout();
          }
        } catch (error) {
          console.error('Error validating token:', error);
          // Network error: fallback to stored user info if available to avoid kicking user offline instantly
          const storedUser = localStorage.getItem('apex_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            logout();
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('apex_token', data.token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Register handler
  const register = async (name, email, password, role, custNum) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role, custNum })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.pendingApproval) {
        return { success: true, pendingApproval: true, message: data.message };
      }

      localStorage.setItem('apex_token', data.token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
    setToken(null);
    setUser(null);
  };

  // Update Profile handler
  const updateProfile = async (name, custNum) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, custNum })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      localStorage.setItem('apex_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  // Change Password handler
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, changePassword, API_URL }}>
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
