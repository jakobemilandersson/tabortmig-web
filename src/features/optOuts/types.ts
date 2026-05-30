import type { Timestamp } from 'firebase/firestore';

export interface UserDoc {
  email: string;
  isPaid: boolean;
  paidUntil: Timestamp | null;
}

export interface OptOutEntry {
  siteId: string;
  optOutDate: Timestamp;
  expiryDate: Timestamp;
}
