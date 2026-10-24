import type { User } from "./api";

export const fullName = (u: User) =>
  [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;

export const initials = (u: User) => {
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  return (f + l || u.username[0]).toUpperCase();
};
