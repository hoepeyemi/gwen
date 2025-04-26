"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import LoadingScreen from "~/app/wallet/_components/loading-screen";

export default function BillsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (user && user.walletAddress) {
        // Redirect to the user's bills page using their wallet address
        router.push(`/dashboard/${user.walletAddress}/bills`);
      } else if (user) {
        // User is authenticated but doesn't have a wallet address yet
        // Try using user.id for routing
        router.push(`/dashboard/${user.id}/bills`);
      } else {
        // User not authenticated, redirect to sign in
        router.push("/auth/signin");
      }
    }
  }, [user, isLoading, router]);
  
  // Show loading while checking auth and redirecting
  return <LoadingScreen />;
} 