import type { Data } from "./store";

// Swap this implementation for an AWS-backed one later; the UI only depends on this interface.
export interface LedgerRepository {
  load(): Promise<Data | null>;
  save(data: Data): Promise<void>;
}

const KEY = "account-site:v1";

export const localRepository: LedgerRepository = {
  async load() {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Data) : null;
  },
  async save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },
};

export const repository: LedgerRepository = localRepository;
