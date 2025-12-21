import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MLBattle - Machine Learning Competition Platform",
  description: "The ultimate Machine Learning competition platform. Compete, learn, and rise through the ranks with real-time leaderboards and ELO ratings.",
  keywords: ["machine learning", "ML competitions", "kaggle", "data science", "AI", "ELO rating"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
