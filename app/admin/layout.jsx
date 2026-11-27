"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useSession } from "@lib/auth-client";
import { isAdminClient } from "@/lib/admin-client";

const titles = {
  "/admin": "Admin",
  "/admin/quotes": "Manage quotes",
  "/admin/templates": "Manage templates",
  "/admin/images": "Manage images",
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/");
      return;
    }
    if (!isAdminClient(session.user)) {
      setDenied(true);
    }
  }, [isPending, router, session]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading admin…
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-2xl font-bold">404</h1>
        <p className="text-muted-foreground">This admin page could not be found.</p>
      </div>
    );
  }

  if (!session?.user || !isAdminClient(session.user)) {
    return null;
  }

  return (
    <DashboardShell title={titles[pathname] || "Admin"} variant="admin">
      {children}
    </DashboardShell>
  );
}
