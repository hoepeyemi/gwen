import "~/styles/globals.css";

import { type Metadata } from "next";

import { Card } from "~/components/ui/card";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Druid",
  description: "Send money to your friends and family",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-blue-50 to-white">
      <Card className="m-0 h-auto w-full max-w-md border-none bg-transparent shadow-none">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </Card>
      <span className="mt-4 text-xs text-zinc-500">
        © Druid, All rights reserved.
      </span>
    </div>
  );
}
