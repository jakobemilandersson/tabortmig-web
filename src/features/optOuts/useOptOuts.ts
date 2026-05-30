import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';
import type { OptOutEntry } from './types';

export interface UseOptOutsReturn {
  entries: Record<string, OptOutEntry>;
  loading: boolean;
  error: string | null;
}

export function useOptOuts(uid: string | null): UseOptOutsReturn {
  const [entries, setEntries] = useState<Record<string, OptOutEntry>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setEntries({});
      return;
    }

    setLoading(true);
    setError(null);

    getDocs(collection(db, 'users', uid, 'optOutEntries'))
      .then((snapshot) => {
        const result: Record<string, OptOutEntry> = {};
        snapshot.forEach((doc) => {
          result[doc.id] = doc.data() as OptOutEntry;
        });
        setEntries(result);
      })
      .catch(() => setError('Kunde inte hämta dina avanmälningar.'))
      .finally(() => setLoading(false));
  }, [uid]);

  return { entries, loading, error };
}
