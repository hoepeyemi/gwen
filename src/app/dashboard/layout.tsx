import { type Metadata, type Viewport } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Gwen",
  description: "Manage your finances with Gwen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white pb-8">
      {children}
    </main>
  );
} 