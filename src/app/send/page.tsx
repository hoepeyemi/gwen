"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import LoadingScreen from "~/app/wallet/_components/loading-screen";

export default function SendPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (user && user.walletAddress) {
        // Redirect to the user's send page with wallet address
        router.push(`/dashboard/${user.walletAddress}/send`);
      } else if (user && user.id) {
        // Fallback to using user ID if wallet address isn't available
        router.push(`/dashboard/${user.id}/send`);
      } else {
        // User not authenticated, redirect to sign in
        router.push("/auth/signin");
      }
    }
  }, [user, isLoading, router]);
  
  // Show loading while checking auth and redirecting
  return <LoadingScreen />;
} 