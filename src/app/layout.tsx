import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnalyseDB AI",
  description: "AI-powered analysis for your data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.plot.ly/plotly-2.27.1.min.css" />
      </head>
      <body className={inter.className}>
        <Script
          src="https://cdn.plot.ly/plotly-2.27.1.min.js"
          strategy="afterInteractive"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
