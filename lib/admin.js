import { getCurrentUser } from "@lib/session";

function adminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  const email = (user.email || "").toLowerCase();
  return email.length > 0 && adminEmails().includes(email);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) {
    return null;
  }
  return user;
}
