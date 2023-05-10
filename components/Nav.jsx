"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {signIn, signOut, useSession, getProviders} from "next-auth/react";

const Nav = () => {
  return (
    <nav className="w-full pt-3 mb-16">
      <Link href="/" className="gap-2 flex-start">
        <Image 
          src="/assets/images/logo.svg"
          alt="premptopia"
          width={30}
          height={30}
          className="object-contain"
        />
        <p className="logo_text">Promptopia</p>
      </Link>
      
      {/* {Mobile Navigation} */}
      <div className="hidden sm:flex">
        
      </div>
    </nav>
  )
}

export default Nav




















