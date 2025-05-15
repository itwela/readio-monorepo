import type { Metadata } from "next";
import { colors } from "../styleUtils/colors";

export const metadata: Metadata = {
  title: "Lotus - Terms of Service",
  description: "Terms of Service for Lotus App",
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{backgroundColor: colors.readioBlack}} className="min-h-screen text-white p-4 md:p-8 max-w-4xl mx-auto">
      {children}
    </div>
  );
}
