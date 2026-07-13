import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import insforge from './insforge';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
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
        const { data, error } = await insforge.auth.getCurrentUser();

        if (cancelled) return;

        if (error || !data?.user) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        const authUser = data.user;
        const email = authUser.email || '';
        const userId = authUser.id;

        setUser({
          id: userId,
          email,
          name: authUser.raw_user_meta_data?.name || authUser.email?.split('@')[0] || 'User',
        });

        const { data: existing } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (existing) {
          setProfile(existing);
        } else {
          // Migration: try to find profile by email (for existing Clerk users)
          const { data: byEmail } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (!cancelled && byEmail) {
            await insforge.database
              .from('profiles')
              .update({ user_id: userId })
              .eq('id', byEmail.id);
            setProfile({ ...byEmail, user_id: userId });
          } else {
            const { data: firstAgency } = await insforge.database
              .from('agencies')
              .select('id')
              .limit(1)
              .maybeSingle();

            if (!cancelled && firstAgency) {
              const { data: newProfile } = await insforge.database
                .from('profiles')
                .insert([{
                  user_id: userId,
                  agency_id: firstAgency.id,
                  name: authUser.raw_user_meta_data?.name || email.split('@')[0] || 'User',
                  email,
                  role: 'Admin / Business Owner',
                  phone: '',
                }])
                .select()
                .single();

              if (newProfile) setProfile(newProfile);
            }
          }
        }
      } catch (err) {
        console.error('[Auth] Hydrate error:', err);
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
    try {
      const { data } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setProfile(data);
    } catch (err) {
      console.error('[Auth] Profile refresh error:', err);
    }
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
