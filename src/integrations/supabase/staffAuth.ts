const STAFF_STORAGE_KEY = "nextwave_staff_auth";

export type ErpRole = "ceo" | "coo" | "hr" | "finance" | "project-manager" | "member" | "head-of-operations" | "head-of-programs" | "head-of-marketing";
export type Department = "executive" | "operations" | "human-resources" | "finance" | "projects" | "engineering" | "programs" | "marketing";

type StaffCredentials = {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  erpRole: ErpRole;
  department: Department;
  title: string;
};

const STAFF_ACCOUNTS: StaffCredentials[] = [
  {
    id: "staff-ceo",
    email: "ceo@nextwave.com",
    password: "Vlxne.svd22",
    name: "Khalifa",
    roles: ["admin", "erp"],
    erpRole: "ceo",
    department: "executive",
    title: "Chief Executive Officer",
  },
  {
    id: "staff-coo",
    email: "coo@nextwave.com",
    password: "Vlxne.svd22",
    name: "Ahmad Sani",
    roles: ["admin", "erp"],
    erpRole: "coo",
    department: "operations",
    title: "Chief Operations Officer",
  },
  {
    id: "staff-hr",
    email: "hr@nextwave.com",
    password: "Vlxne.svd22",
    name: "Aisha Mohammed",
    roles: ["erp"],
    erpRole: "hr",
    department: "human-resources",
    title: "HR Manager",
  },
  {
    id: "staff-finance",
    email: "finance@nextwave.com",
    password: "Vlxne.svd22",
    name: "Ibrahim Musa",
    roles: ["erp"],
    erpRole: "finance",
    department: "finance",
    title: "Finance Manager",
  },
  {
    id: "staff-pm",
    email: "pm@nextwave.com",
    password: "Vlxne.svd22",
    name: "Fatima Usman",
    roles: ["erp"],
    erpRole: "project-manager",
    department: "projects",
    title: "Project Manager",
  },
  {
    id: "staff-member-1",
    email: "ahmadsalisu@nextwave.com",
    password: "Vlxne.svd22",
    name: "Ahmad Salisu",
    roles: ["erp"],
    erpRole: "member",
    department: "engineering",
    title: "Software Engineer",
  },
  {
    id: "staff-member-2",
    email: "member@nextwave.com",
    password: "Vlxne.svd22",
    name: "Zainab Abdullah",
    roles: ["erp"],
    erpRole: "member",
    department: "engineering",
    title: "Junior Developer",
  },
  {
    id: "staff-head-ops",
    email: "operations@nextwave.com",
    password: "Vlxne.svd22",
    name: "Musa Ibrahim",
    roles: ["erp"],
    erpRole: "head-of-operations",
    department: "operations",
    title: "Head of Operations",
  },
  {
    id: "staff-head-programs",
    email: "programs@nextwave.com",
    password: "Vlxne.svd22",
    name: "Sarah Okafor",
    roles: ["erp"],
    erpRole: "head-of-programs",
    department: "programs",
    title: "Head of Programs",
  },
  {
    id: "staff-head-marketing",
    email: "marketing@nextwave.com",
    password: "Vlxne.svd22",
    name: "Chidi Eze",
    roles: ["erp"],
    erpRole: "head-of-marketing",
    department: "marketing",
    title: "Head of Marketing",
  },
];

export type StaffAuthSession = {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      erpRole: ErpRole;
      department: Department;
      title: string;
    };
    app_metadata: { roles: string[] };
  };
  session: {
    access_token: string;
    expires_at: number;
  };
};

const DASHBOARD_ROUTES: Record<ErpRole, string> = {
  ceo: "/dashboard",
  coo: "/dashboard",
  hr: "/dashboard",
  finance: "/dashboard",
  "project-manager": "/dashboard",
  member: "/dashboard",
  "head-of-operations": "/dashboard",
  "head-of-programs": "/dashboard",
  "head-of-marketing": "/dashboard",
};

const ROLE_LABELS: Record<ErpRole, string> = {
  ceo: "Executive",
  coo: "Operations",
  hr: "Human Resources",
  finance: "Finance",
  "project-manager": "Projects",
  member: "Staff",
  "head-of-operations": "Operations",
  "head-of-programs": "Programs",
  "head-of-marketing": "Marketing",
};

const ROLE_DESCRIPTIONS: Record<ErpRole, string> = {
  ceo: "Company-wide oversight and strategic planning",
  coo: "Operational management and resource allocation",
  hr: "Employee management and organizational culture",
  finance: "Financial planning, budgets, and reporting",
  "project-manager": "Project tracking and team coordination",
  member: "Task management and personal productivity",
  "head-of-operations": "Day-to-day operations and process optimization",
  "head-of-programs": "Program development and impact tracking",
  "head-of-marketing": "Brand strategy, outreach, and growth",
};

export function getDashboardRoute(role: ErpRole): string {
  return DASHBOARD_ROUTES[role] ?? "/dashboard";
}

export function getRoleLabel(role: ErpRole): string {
  return ROLE_LABELS[role] ?? "Staff";
}

export function getRoleDescription(role: ErpRole): string {
  return ROLE_DESCRIPTIONS[role] ?? "";
}

export function getErpModuleAccess(role: ErpRole): string[] {
  const access: Record<ErpRole, string[]> = {
    ceo: ["overview", "analytics", "hr", "finance", "projects", "operations", "settings", "audit", "contact", "waitlist"],
    coo: ["overview", "operations", "projects", "hr", "settings"],
    hr: ["overview", "hr", "settings"],
    finance: ["overview", "finance", "settings"],
    "project-manager": ["overview", "projects", "settings"],
    member: ["overview", "tasks", "settings"],
    "head-of-operations": ["overview", "operations", "projects", "settings"],
    "head-of-programs": ["overview", "projects", "analytics", "settings"],
    "head-of-marketing": ["overview", "marketing", "analytics", "contact", "settings"],
  };
  return access[role] ?? ["overview"];
}

export function isStaffCredentials(email: string, password: string) {
  return STAFF_ACCOUNTS.some(
    (account) => email.trim().toLowerCase() === account.email && password === account.password
  );
}

function buildStaffSession(account: StaffCredentials): StaffAuthSession {
  return {
    user: {
      id: account.id,
      email: account.email,
      user_metadata: {
        name: account.name,
        erpRole: account.erpRole,
        department: account.department,
        title: account.title,
      },
      app_metadata: { roles: account.roles },
    },
    session: {
      access_token: `${account.id}-token`,
      expires_at: Number.MAX_SAFE_INTEGER,
    },
  };
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
