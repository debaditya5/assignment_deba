import "./globals.css";
import type { ReactNode } from "react";
import { HeaderBar } from "@components/HeaderBar";
import { AdminProvider } from "@lib/adminContext";

export const metadata = {
  title: "Benefits Coverage Agent – KPI Dashboard",
  description: "Multi-tenant SaaS KPI command center with charts, exports, and agentic insights.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AdminProvider>
          <header className="border-b bg-white">
            <HeaderBar />
          </header>
          <main className="w-full px-2 py-4">{children}</main>
        </AdminProvider>
      </body>
    </html>
  );
}


