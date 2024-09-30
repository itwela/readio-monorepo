'use client'
import cn from "clsx";
import { HTMLAttributes } from "react";
import {
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Link from "next/link";
import useGSAP from '@gsap/react'
import { useReadioMenu } from "@/app/hooks/menuContextProvider";
import { IoMdMenu } from "react-icons/io";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6; // Define heading levels
}

const ReadioHeading = (props: HeadingProps) => {
  const { className, children, ...rest } = props;
  const { isMenuOpen, setIsMenuOpen } = useReadioMenu();

  return (
    <>
    <div className="w-full absolute top-0 z-10 bg-white h-[10%] place-self-start flex justify-between items-center px-8"> 
      
      <div className="">
        <Link href="/" className="">
          <span className="text-red-500">R</span>
          <span>eadio</span>
        </Link>
      </div>
    
      <div>

      <IoMdMenu className="text-3xl text-black" onClick={() => setIsMenuOpen(!isMenuOpen)} />

      <SignedIn>

      </SignedIn>

      <SignedOut>

        <div className="flex gap-4">

        <Link href='/sign-in' className="">
          Sign in
        </Link>

        <Link href='/sign-up' className="">
          Sign up
        </Link>

        <Link href='/library'>
          Library
        </Link>

        </div>

      </SignedOut>

      </div>

    </div>
    </>
  );
};

export default ReadioHeading;