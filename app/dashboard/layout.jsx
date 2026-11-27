"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useSession } from "@lib/auth-client";

const titles = {
  "/dashboard": "Dashboard",
  "/dashboard/quotes": "My quotes",
  "/dashboard/quotes/new": "New quote",
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
    }
  }, [isPending, router, session]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading studio…
      </div>
    );
  }

  const title =
    titles[pathname] ||
    (pathname.startsWith("/dashboard/quotes/") ? "Edit quote" : "Dashboard");

  return (
    <DashboardShell title={title} variant="user">
      {children}
    </DashboardShell>
  );
}
