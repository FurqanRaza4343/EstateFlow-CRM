import { createContext, useContext, useState, ReactNode } from 'react';

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
  loading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<AuthUser | null>(null);
  const [profile] = useState<any | null>(null);

  const signOut = async () => {};

  const refreshProfile = async () => {};

  return (
    <AuthContext.Provider value={{ user, profile, loading: false, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
