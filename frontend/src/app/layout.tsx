import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Golf Charity Platform",
  description: "Play golf. Win prizes. Support charity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className={`${inter.variable} min-h-full flex flex-col bg-[#0a0a0a] text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
