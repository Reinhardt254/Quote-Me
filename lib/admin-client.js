export function isAdminClient(user) {
  if (!user) return false;
  if (user.role === "admin") return true;

  const configured =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
      : "";

  const emails = configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const email = (user.email || "").toLowerCase();
  return email.length > 0 && emails.includes(email);
}
