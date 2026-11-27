"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "@lib/auth-client";
import { isAdminClient } from "@/lib/admin-client";

const SiteHeader = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const image = session?.user?.image;
  const admin = isAdminClient(session?.user);

  const handleSignIn = () => {
    signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const handleSignOut = () => {
    setOpen(false);
    signOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            Q
          </span>
          <span className="text-lg font-bold tracking-tight">Quote-Me</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/#templates" className="hover:text-foreground">
            Templates
          </Link>
          <Link href="/#feed" className="hover:text-foreground">
            Discover
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              {admin ? (
                <Link href="/admin" className="hover:text-foreground">
                  Admin
                </Link>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <>
              <Button asChild>
                <Link href="/dashboard/quotes/new">Create quote</Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
              {image ? (
                <Link href="/dashboard">
                  <Image
                    src={image}
                    width={36}
                    height={36}
                    className="rounded-full"
                    alt="profile"
                  />
                </Link>
              ) : null}
            </>
          ) : (
            <Button onClick={handleSignIn}>Sign in with Google</Button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            <Link href="/#templates" onClick={() => setOpen(false)}>
              Templates
            </Link>
            <Link href="/#feed" onClick={() => setOpen(false)}>
              Discover
            </Link>
            {session?.user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                {admin ? (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    Admin
                  </Link>
                ) : null}
                <Button asChild>
                  <Link href="/dashboard/quotes/new">Create quote</Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button onClick={handleSignIn}>Sign in with Google</Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default SiteHeader;
