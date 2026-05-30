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

    // TODO: consider switching to onSnapshot for live updates when the account
    // page is built, so opt-out state stays in sync without a manual refresh.
    getDocs(collection(db, 'users', uid, 'optOutEntries'))
      .then((snapshot) => {
        const result: Record<string, OptOutEntry> = {};
        snapshot.forEach((doc) => {
          result[doc.id] = doc.data() as OptOutEntry;
        });
        setEntries(result);
      })
      .catch(() => setError('Kunde inte h\u00e4mta dina avanm\u00e4lningar.'))
      .finally(() => setLoading(false));
  }, [uid]);

  return { entries, loading, error };
}
