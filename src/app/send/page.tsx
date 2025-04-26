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
        // Redirect to the user's send page with their wallet address
        router.push(`/dashboard/${user.walletAddress}/send`);
      } else if (user) {
        // User is authenticated but doesn't have a wallet address
        // Try to get wallet address from localStorage
        try {
          const userData = localStorage.getItem("auth_user");
          if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.walletAddress) {
              router.push(`/dashboard/${parsedUser.walletAddress}/send`);
              return;
            }
          }
        } catch (error) {
          console.error("Error retrieving wallet address:", error);
        }
        
        // If no wallet address found, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User not authenticated, redirect to sign in
        router.push("/auth/signin");
      }
    }
  }, [user, isLoading, router]);
  
  // Show loading while checking auth and redirecting
  return <LoadingScreen />;
} 