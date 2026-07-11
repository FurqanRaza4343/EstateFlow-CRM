import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import insforge from './insforge';
import { useInsforgeClient } from './useInsforgeClient';

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
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useInsforgeClient();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress || '';

    setUser({
      id: clerkUser.id,
      email,
      profile: clerkUser,
    });

    const fetchOrCreateProfile = async () => {
      const { data: existing } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('clerk_id', clerkUser.id)
        .maybeSingle();

      if (existing) {
        setProfile(existing);
        setLoading(false);
        return;
      }

      const { data: firstAgency } = await insforge.database
        .from('agencies')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (firstAgency) {
        const { data: newProfile } = await insforge.database
          .from('profiles')
          .insert([{
            clerk_id: clerkUser.id,
            user_id: crypto.randomUUID(),
            agency_id: firstAgency.id,
            name: clerkUser.fullName || clerkUser.firstName || email.split('@')[0] || 'User',
            email,
            role: 'Admin / Business Owner',
            phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
          }])
          .select()
          .single();

        if (newProfile) setProfile(newProfile);
      }

      setLoading(false);
    };

    fetchOrCreateProfile();
  }, [isSignedIn, clerkUser, isLoaded]);

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('clerk_id', user.id)
      .maybeSingle();
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
