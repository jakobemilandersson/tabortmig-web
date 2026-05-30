import { useState, useEffect } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type AuthError,
} from 'firebase/auth';
import app from './firebaseConfig';

const auth = getAuth(app);

export type AuthErrorMessage = string;

export interface UseAuthReturn {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthErrorMessage | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthErrorMessage | null }>;
  signOut: () => Promise<void>;
}

function mapAuthError(err: AuthError): AuthErrorMessage {
  switch (err.code) {
    case 'auth/email-already-in-use':
      return 'Den e-postadressen används redan.';
    case 'auth/invalid-email':
      return 'Ogiltig e-postadress.';
    case 'auth/weak-password':
      return 'Lösenordet är för svagt. Minst 6 tecken.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Felaktig e-postadress eller lösenord.';
    case 'auth/too-many-requests':
      return 'För många försök. Försök igen senare.';
    default:
      return 'Något gick fel. Försök igen.';
  }
}

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err as AuthError) };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: mapAuthError(err as AuthError) };
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { currentUser, loading, signUp, signIn, signOut };
}
