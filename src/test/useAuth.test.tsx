import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock firebase/app so no real Firebase initialisation happens
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

// Mock firebase/firestore so getFirestore() in firebaseConfig doesn't crash
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

// Capture the onAuthStateChanged callback so we can control it
let authStateCallback: ((user: null) => void) | null = null;

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: null) => void) => {
    authStateCallback = cb;
    return vi.fn(); // unsubscribe
  }),
}));

import { useAuth } from '../features/auth/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    authStateCallback = null;
  });

  it('returns null currentUser before sign-in', () => {
    const { result } = renderHook(() => useAuth());
    // onAuthStateChanged has not fired yet → loading true, currentUser null
    expect(result.current.currentUser).toBeNull();
  });

  it('sets loading to false after auth state resolves', async () => {
    const { result } = renderHook(() => useAuth());
    // Wrap the state-updating callback in act() so React flushes the update
    await act(async () => {
      authStateCallback?.(null);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });
});
