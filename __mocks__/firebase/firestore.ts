import { vi } from 'vitest'
export const getFirestore = vi.fn(() => ({}))
export const collection = vi.fn()
export const getDocs = vi.fn()
export const doc = vi.fn()
export const setDoc = vi.fn()
export const Timestamp = {
  fromDate: (d: Date) => ({ toDate: () => d }),
}
