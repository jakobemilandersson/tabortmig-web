import { vi } from 'vitest'
export const getAuth = vi.fn(() => ({}))
export const onAuthStateChanged = vi.fn()
export const createUserWithEmailAndPassword = vi.fn()
export const signInWithEmailAndPassword = vi.fn()
export const signOut = vi.fn()
