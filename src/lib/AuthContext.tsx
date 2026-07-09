import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import insforge from './insforge';

interface AuthUser {
  id: string;
  email: string;
  profile: Record<string, any> | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrateAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (!error && data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            profile: data.user,
          });
          const { data: profData } = await insforge.auth.getProfile(data.user.id);
          if (profData) setProfile(profData);
        }
      } catch {
        // No session
      } finally {
        setLoading(false);
      }
    }
    void hydrateAuth();
  }, []);

  const signOut = async () => {
    await insforge.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await insforge.auth.getProfile(user.id);
    if (data) setProfile(data);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
