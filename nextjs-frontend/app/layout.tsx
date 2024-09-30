import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReadioPlayer from "./readio-components/essentials/readio-player";
import { ReadioMainProvider } from "./hooks/playingContextProvider";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { ReadioMenuProvider } from "./hooks/menuContextProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Readio",
  description: "Created by Itwela Ibomu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>    
    <ClerkProvider
        signInFallbackRedirectUrl={"/"}
        signUpFallbackRedirectUrl={"/"}    
    >
        <html lang="en" className="">
          <ReadioMainProvider>
            <ReadioMenuProvider>
              <body className={`${inter.className} overflow-hidden`}>{children}</body>
            </ReadioMenuProvider>
          </ReadioMainProvider>
        </html>
    </ClerkProvider>
    </>
  );
}
