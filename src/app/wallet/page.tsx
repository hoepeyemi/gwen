"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import LoadingScreen from "~/app/wallet/_components/loading-screen";

export default function WalletLogin() {
  const { user, isLoading, solanaWalletAddress } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // First check if we have a solanaWalletAddress from Civic
      if (solanaWalletAddress) {
        console.log("Redirecting to wallet with Civic address:", solanaWalletAddress);
        router.push(`/wallet/${solanaWalletAddress}`);
        return;
      }
      
      // Then check user data
      if (user) {
        // Check if user has a wallet address
        const userData = localStorage.getItem("auth_user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.walletAddress) {
            // User has a wallet address, redirect to their wallet
            console.log("Redirecting to wallet with stored address:", parsedUser.walletAddress);
            router.push(`/wallet/${parsedUser.walletAddress}`);
          } else {
            // User has no wallet address, redirect to dashboard
            console.log("No wallet address found, redirecting to dashboard");
            router.push("/dashboard");
          }
        } else {
          // No user data found, redirect to dashboard
          console.log("No user data found, redirecting to dashboard");
          router.push("/dashboard");
        }
      } else {
        // User is not authenticated, redirect to signin
        console.log("User not authenticated, redirecting to signin");
        router.push("/auth/signin");
      }
    }
  }, [user, isLoading, router, solanaWalletAddress]);

  // Show loading screen while checking authentication
  return <LoadingScreen />;
}
