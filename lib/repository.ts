import type { Data } from "./store";

// Swap this implementation for an AWS-backed one later; the UI only depends on this interface.
export interface LedgerRepository {
  load(userId: string): Promise<Data | null>;
  save(userId: string, data: Data): Promise<void>;
}

const key = (userId: string) => `account-site:v1:${userId}`;

export const localRepository: LedgerRepository = {
  async load(userId) {
    const raw = localStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as Data) : null;
  },
  async save(userId, data) {
    localStorage.setItem(key(userId), JSON.stringify(data));
  },
};

export const repository: LedgerRepository = localRepository;
