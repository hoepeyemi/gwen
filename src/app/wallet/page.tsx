"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import LoadingScreen from "~/app/wallet/_components/loading-screen";

export default function WalletLogin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Check if user has a wallet address
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.walletAddress) {
          // User has a wallet address, redirect to their wallet
          router.push(`/wallet/${user.walletAddress}`);
        } else {
          // User has no wallet address, redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        // No user data found, redirect to dashboard
        router.push("/dashboard");
      }
    } else if (!isLoading && !user) {
      // User is not authenticated, redirect to signin
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking authentication
  return <LoadingScreen />;
}
