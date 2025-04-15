import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Nunito } from 'next/font/google';

import { TRPCReactProvider } from "~/trpc/react";
import ToasterProvider from "~/providers/toaster-provider";
import { AuthProvider } from "~/providers/auth-provider";
import Background from "./components/background";

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: "Druid",
  description: "Send money to your friends and family",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${nunito.variable}`}>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <TRPCReactProvider>
          <ToasterProvider />
          <AuthProvider>
            <Background>
              {children}
            </Background>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}