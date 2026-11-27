"use client";

import Link from "next/link";
import Image from "next/image";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { signOut, useSession } from "@lib/auth-client";

export default function DashboardShell({
  children,
  title,
  variant = "user",
}) {
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      <AppSidebar variant={variant} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between gap-3">
            <h1 className="text-sm font-semibold">{title}</h1>
            <div className="flex items-center gap-2">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : null}
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/quotes/new">New quote</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => {} } })}
              >
                Sign out
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
