import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import { cn } from "@/lib/cn";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Joshua Lawrence",
  description: "A personal site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <div className="container mx-auto max-w-screen-xl min-h-screen justify-center">
          <Header />
          <div className="w-full z-50">{children}</div>
        </div>
      </body>
    </html>
  );
}
