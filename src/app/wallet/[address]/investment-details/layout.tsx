"use client";
import { Suspense } from "react";

export default function InvestmentDetailsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-md p-4 sm:p-8 text-center">
          <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base">Loading investment details...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
} 