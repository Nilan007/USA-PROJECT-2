import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, check hardcoded admin credentials
      if (email === 'admin@federaltalks.com' && password === 'Nilan@101088') {
        const mockUser: User = {
          id: '1',
          email: email,
          full_name: 'Admin User',
          role: 'admin',
          is_active: true,
          trial_days_remaining: 0,
          created_at: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { user: mockUser, error: null };
      }

      if (email === 'admin1@federaltalks.com' && password === 'Nilan@101088') {
        const mockUser: User = {
          id: '2',
          email: email,
          full_name: 'User Demo',
          role: 'user',
          is_active: true,
          trial_days_remaining: 7,
          created_at: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { user: mockUser, error: null };
      }

      // Check database for other users
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // In production, use proper password hashing
        .single();

      if (error || !userData) {
        return { user: null, error: 'Invalid email or password' };
      }

      if (!userData.is_active) {
        return { user: null, error: 'Account is inactive. Please contact support or wait for admin approval.' };
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: 'An error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([{
          email,
          password_hash: password, // In production, use proper password hashing
          full_name: fullName,
          company_name: companyName,
          role: 'user',
          is_active: false, // Requires admin approval
          trial_days_remaining: 0
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { error: 'Email already exists. Please use a different email or sign in.' };
        }
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'An error occurred during sign up' };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}