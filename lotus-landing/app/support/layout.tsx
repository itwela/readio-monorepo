import type { Metadata } from "next";
import { colors } from "../styleUtils/colors";

export const metadata: Metadata = {
  title: "Lotus - Support",
  description: "Support for Lotus App",
};

export default function SupportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{backgroundColor: colors.readioBlack}} className=" min-h-screen text-white p-4 md:p-8  mx-auto">
      {children}
    </div>
  );
}
