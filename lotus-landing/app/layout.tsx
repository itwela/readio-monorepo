import type { Metadata } from "next";
import "./globals.css";
import { DbProvider } from "./dbprovider";

export const metadata: Metadata = {
  title: "Lotus",
  description: "Smart Audio Platform | Always Growing",
  viewport: 'width=device-width, user-scalable=no'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden no-scrollbar h-screen">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="antialiased no-scrollbar h-screen overflow-x-hidden">
        <DbProvider>
          {children}
        </DbProvider>
      </body>
    </html>
  );
}
