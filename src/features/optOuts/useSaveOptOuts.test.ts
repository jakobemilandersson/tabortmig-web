import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';

// Mock the Firestore module before importing the hook
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    setDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn((_db, ...segments) => ({ path: segments.join('/') })),
  };
});

// Mock firebaseConfig so we don't need real env vars in tests
vi.mock('../auth/firebaseConfig', () => ({
  db: {},
  default: {},
}));

import { useSaveOptOuts } from './useSaveOptOuts';
import { setDoc, doc } from 'firebase/firestore';

const mockSetDoc = vi.mocked(setDoc);
const mockDoc = vi.mocked(doc);

const TEST_UID = 'user-123';
const NOW = Timestamp.fromDate(new Date('2025-01-01'));
const EXPIRY = Timestamp.fromDate(new Date('2026-01-01'));

const TEST_ENTRIES = {
  ratsit: { siteId: 'ratsit', optOutDate: NOW, expiryDate: EXPIRY },
  mrkoll: { siteId: 'mrkoll', optOutDate: NOW, expiryDate: EXPIRY },
};

describe('useSaveOptOuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setDoc for each entry with the correct Firestore path', async () => {
    const { result } = renderHook(() => useSaveOptOuts(TEST_UID));

    await act(async () => {
      await result.current.saveOptOuts(TEST_ENTRIES);
    });

    expect(mockSetDoc).toHaveBeenCalledTimes(2);

    expect(mockDoc).toHaveBeenCalledWith({}, 'users', TEST_UID, 'optOutEntries', 'ratsit');
    expect(mockDoc).toHaveBeenCalledWith({}, 'users', TEST_UID, 'optOutEntries', 'mrkoll');
  });

  it('calls setDoc with correct entry data', async () => {
    const { result } = renderHook(() => useSaveOptOuts(TEST_UID));

    await act(async () => {
      await result.current.saveOptOuts({ ratsit: TEST_ENTRIES.ratsit });
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      TEST_ENTRIES.ratsit
    );
  });

  it('returns false and sets error when uid is null', async () => {
    const { result } = renderHook(() => useSaveOptOuts(null));

    let success: boolean;
    await act(async () => {
      success = await result.current.saveOptOuts(TEST_ENTRIES);
    });

    expect(success!).toBe(false);
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('sets error when setDoc rejects', async () => {
    mockSetDoc.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useSaveOptOuts(TEST_UID));

    await act(async () => {
      await result.current.saveOptOuts({ ratsit: TEST_ENTRIES.ratsit });
    });

    expect(result.current.error).toBe('Kunde inte spara dina avanmälningar.');
  });
});
