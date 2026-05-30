import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';
import type { OptOutEntry } from './types';

export interface UseSaveOptOutsReturn {
  saving: boolean;
  error: string | null;
  saveOptOuts: (entries: Record<string, OptOutEntry>) => Promise<boolean>;
}

export function useSaveOptOuts(uid: string | null): UseSaveOptOutsReturn {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveOptOuts(entries: Record<string, OptOutEntry>): Promise<boolean> {
    // Callers should guard on auth state before invoking this function.
    // We set an error here so any caller that skips the guard gets visible feedback.
    if (!uid) {
      setError('Du m\u00e5ste vara inloggad f\u00f6r att spara.');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      await Promise.all(
        Object.entries(entries).map(([siteId, entry]) =>
          setDoc(doc(db, 'users', uid, 'optOutEntries', siteId), entry)
        )
      );
      return true;
    } catch {
      setError('Kunde inte spara dina avanm\u00e4lningar.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, saveOptOuts };
}
