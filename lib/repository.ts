import type { Data } from "./store";
import { api } from "./api";

export interface LedgerRepository {
  load(userId: string, token: string): Promise<Data | null>;
  save(userId: string, token: string, data: Data): Promise<void>;
}

const key = (userId: string) => `account-site:v1:${userId}`;
let saveQueue: Promise<void> = Promise.resolve();

export const repository: LedgerRepository = {
  async load(userId, token) {
    const remote = await api<Data | null>("/me/calendar", { token });
    if (remote) return remote;

    const raw = localStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as Data) : null;
  },
  async save(userId, token, data) {
    const saveRequest = () => api("/me/calendar", { method: "PUT", body: data, token });
    const current = saveQueue.then(saveRequest, saveRequest).then(() => undefined);
    saveQueue = current.catch(() => undefined);
    await current;
    localStorage.removeItem(key(userId));
  },
};
