import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SAARTHI - Welfare Recommender",
  description: "AI-powered welfare scheme recommendation assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-[family-name:var(--font-inter)] antialiased text-slate-900 leading-relaxed`}>
        <SplashScreen />
        <Navbar />
        <main className="pt-0">{children}</main>
      </body>
    </html>
  );
}
