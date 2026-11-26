"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn, signOut, useSession } from "@lib/auth-client";

const Nav = () => {
  const { data: session } = useSession();
  const [toggleDropDown, setToggleDropDown] = useState(false);
  const image = session?.user?.image;

  const handleSignIn = () => {
    signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleSignOut = () => {
    setToggleDropDown(false);
    signOut();
  };

  return (
    <nav className="w-full pt-3 mb-16 flex-between">
      <Link href="/" className="gap-2 flex-center">
        <p className="logo_text">Your Quote</p>
      </Link>

      <div className="hidden sm:flex">
        {session?.user ? (
          <div className="flex gap-3 md:gap-5">
            <Link href="/create-prompt" className="black_btn">
              Create Post
            </Link>

            <button type="button" onClick={handleSignOut} className="outline_btn">
              Sign Out
            </button>

            {image ? (
              <Link href="/profile">
                <Image
                  src={image}
                  width={37}
                  height={37}
                  className="rounded-full"
                  alt="profile"
                />
              </Link>
            ) : null}
          </div>
        ) : (
          <button type="button" onClick={handleSignIn} className="black_btn">
            Sign In
          </button>
        )}
      </div>

      <div className="relative flex sm:hidden">
        {session?.user ? (
          <div className="flex">
            {image ? (
              <Image
                src={image}
                width={37}
                height={37}
                className="rounded-full"
                alt="profile"
                onClick={() => setToggleDropDown((prev) => !prev)}
              />
            ) : (
              <button
                type="button"
                className="black_btn"
                onClick={() => setToggleDropDown((prev) => !prev)}
              >
                Menu
              </button>
            )}
            {toggleDropDown && (
              <div className="dropdown">
                <Link
                  href="/profile"
                  className="dropdown_link"
                  onClick={() => setToggleDropDown(false)}
                >
                  my profile
                </Link>
                <Link
                  href="/create-prompt"
                  className="dropdown_link"
                  onClick={() => setToggleDropDown(false)}
                >
                  Create Prompt
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full mt-5 black_btn"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={handleSignIn} className="black_btn h-8">
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
