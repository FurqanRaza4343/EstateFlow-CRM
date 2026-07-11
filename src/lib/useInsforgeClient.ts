import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import insforge from './insforge';

const TOKEN_REFRESH_MS = 50000;

export function useInsforgeClient() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      insforge.setAccessToken(null);
      return;
    }

    let cancel = false;
    const refresh = async () => {
      try {
        const token = await getToken({ template: 'insforge' });
        if (cancel) return;
        insforge.setAccessToken(token ?? null);
      } catch {
        if (cancel) return;
        insforge.setAccessToken(null);
      }
    };

    refresh();
    const id = setInterval(refresh, TOKEN_REFRESH_MS);
    return () => { cancel = true; clearInterval(id); };
  }, [getToken, isSignedIn]);
}
