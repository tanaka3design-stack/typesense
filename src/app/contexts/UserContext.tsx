import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UserContextType {
  userId: string | null;
  name: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (userId: string, name: string, accessToken: string) => void;
  updateName: (name: string) => void;
  logout: () => void;
  refreshSession: () => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has an active session
    const checkSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        
        if (session?.access_token && session?.user?.id) {
          setUserId(session.user.id);
          setAccessToken(session.access_token);
          
          // Get user name from metadata
          const userName = session.user.user_metadata?.name;
          if (userName) {
            setName(userName);
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };

    checkSession();

    // Listen for auth state changes
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token && session?.user?.id) {
          console.log('Auth state changed, updating session');
          setUserId(session.user.id);
          setAccessToken(session.access_token);
          
          const userName = session.user.user_metadata?.name;
          if (userName) {
            setName(userName);
          }
        } else {
          setUserId(null);
          setAccessToken(null);
          setName(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const refreshSession = async (): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, returning existing token');
      return accessToken;
    }

    try {
      console.log('Attempting to refresh session...');
      console.log('Current access token (first 20 chars):', accessToken?.substring(0, 20));
      
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        
        // Try to get current session instead
        console.log('Attempting to get current session instead...');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !currentSession?.access_token) {
          console.error('Failed to get current session:', sessionError);
          return null;
        }
        
        console.log('Got current session token (first 20 chars):', currentSession.access_token.substring(0, 20));
        setAccessToken(currentSession.access_token);
        return currentSession.access_token;
      }
      
      if (session?.access_token) {
        console.log('Session refreshed successfully (first 20 chars):', session.access_token.substring(0, 20));
        setAccessToken(session.access_token);
        return session.access_token;
      }
      
      console.warn('No access token in refreshed session');
      return accessToken;
    } catch (err) {
      console.error('Error refreshing session:', err);
      return null;
    }
  };

  const setUser = (newUserId: string, newName: string, newAccessToken: string) => {
    setUserId(newUserId);
    setName(newName);
    setAccessToken(newAccessToken);
  };

  const updateName = (newName: string) => {
    setName(newName);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUserId(null);
    setName(null);
    setAccessToken(null);
  };

  return (
    <UserContext.Provider value={{ 
      userId, 
      name, 
      accessToken,
      isAuthenticated: !!userId,
      setUser,
      updateName,
      logout,
      refreshSession
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}