import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-[family-name:var(--font-space-grotesk)] antialiased`}>
        <SplashScreen />
        <Navbar />
        <main className="pt-2">{children}</main>
      </body>
    </html>
  );
}
