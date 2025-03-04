import { auth } from "@/auth";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./_components/sidebar";

// Define Google Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

// Define metadata
export const metadata: Metadata = {
  title: "Appomania - Dashboard",
  description: "Appointment Management service",
};

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={poppins.className}>
          <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="container max-w-6xl py-6 space-y-6">
                {children}
              </div>
            </main>
            <Toaster />
          </div>
        </body>
      </html>
    </SessionProvider>
  );
}


/*import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { db } from "@/lib/db";

const poppins = Poppins({ subsets: ["latin"], weight:["400"] });

export const metadata: Metadata = {
  title: "Key Auth Apps",
  description: "Created by Mousa ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await db.user.findMany()
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
*/