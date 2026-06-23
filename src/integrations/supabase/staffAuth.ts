const STAFF_STORAGE_KEY = "nextwave_staff_auth";

type StaffCredentials = {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  staffRole: "ceo" | "coo" | "member";
};

const STAFF_ACCOUNTS: StaffCredentials[] = [
  {
    id: "staff-ceo",
    email: "ceo@nextwave.com",
    password: "Vlxne.svd22",
    name: "Khalifa",
    roles: ["admin"],
    staffRole: "ceo",
  },
  {
    id: "staff-coo",
    email: "coo@nextwave.com",
    password: "Vlxne.svd22",
    name: "Ahmad Sani",
    roles: ["admin"],
    staffRole: "coo",
  },
  {
    id: "staff-member",
    email: "ahmadsalisu@nextwave.com",
    password: "Vlxne.svd22",
    name: "Ahmad Salisu",
    roles: ["admin"],
    staffRole: "member",
  },
];

export type StaffAuthSession = {
  user: {
    id: string;
    email: string;
    user_metadata: { name: string; staffRole: "ceo" | "coo" | "member" };
    app_metadata: { roles: string[] };
  };
  session: {
    access_token: string;
    expires_at: number;
  };
};

function buildStaffSession(account: StaffCredentials): StaffAuthSession {
  return {
    user: {
      id: account.id,
      email: account.email,
      user_metadata: { name: account.name, staffRole: account.staffRole },
      app_metadata: { roles: account.roles },
    },
    session: {
      access_token: `${account.id}-token`,
      expires_at: Number.MAX_SAFE_INTEGER,
    },
  };
}

export function isStaffCredentials(email: string, password: string) {
  return STAFF_ACCOUNTS.some(
    (account) => email.trim().toLowerCase() === account.email && password === account.password
  );
}

export function setStaffSession(email: string) {
  if (typeof window === "undefined") return;
  const account = STAFF_ACCOUNTS.find((account) => account.email === email.trim().toLowerCase());
  if (!account) return;
  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(buildStaffSession(account)));
}

export function clearStaffSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STAFF_STORAGE_KEY);
}

export function getStaffSession(): StaffAuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STAFF_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StaffAuthSession;
  } catch {
    return null;
  }
}

export function isStaffSession() {
  const session = getStaffSession();
  return Boolean(session?.session?.access_token);
}
