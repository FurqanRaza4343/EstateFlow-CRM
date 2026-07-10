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
    let cancelled = false;
    async function hydrateAuth() {
      try {
        // Check if OAuth code exchange might be in progress
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthCode = urlParams.has('insforge_code');

        const { data, error } = await insforge.auth.getCurrentUser();
        if (cancelled) return;

        if (!error && data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            profile: data.user,
          });
          const { data: profData } = await insforge.auth.getProfile(data.user.id);
          if (profData && !cancelled) setProfile(profData);
          setLoading(false);
          return;
        }

        // OAuth redirect — SDK might still be exchanging the code
        if (hasOAuthCode) {
          await new Promise(r => setTimeout(r, 3000));
          if (cancelled) return;
          const retryResult = await insforge.auth.getCurrentUser();
          if (!retryResult.error && retryResult.data?.user) {
            setUser({
              id: retryResult.data.user.id,
              email: retryResult.data.user.email,
              profile: retryResult.data.user,
            });
            const { data: profData } = await insforge.auth.getProfile(retryResult.data.user.id);
            if (profData && !cancelled) setProfile(profData);
          }
        }
      } catch {
        // No session
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void hydrateAuth();
    return () => { cancelled = true; };
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
