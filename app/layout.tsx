import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/lib/providers/client-provider"
import QueryProvider from "@/components/providers/query-provider"

// Define Google Poppins font
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  display: 'swap',
});

// Define metadata
export const metadata: Metadata = {
  title: "Appomania | Professional Appointment Management System",
  description: "Transform your business with our modern appointment management solution. Streamline scheduling, boost efficiency, and deliver premium customer experiences.",
  keywords: "appointment management, business scheduling, online booking system, professional scheduling",
  authors: [{ name: "Appomania Team" }],
};

// Define viewport separately
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1330BE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <QueryProvider>
          <ClientProvider>
            {children}
          </ClientProvider>
        </QueryProvider>
      </body>
    </html>
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