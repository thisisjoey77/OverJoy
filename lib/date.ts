export const pad = (n: number) => String(n).padStart(2, "0");

export const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const startOfWeek = (d: Date) => addDays(d, -d.getDay());

export const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const shortDate = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
