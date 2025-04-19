import { type Metadata, type Viewport } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Gwen",
  description: "Manage your finances with Gwen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
} 