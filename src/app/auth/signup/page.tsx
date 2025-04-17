"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ExternalLink, UserPlus } from "lucide-react";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useAuth } from "~/providers/auth-provider";

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const civicUser = useUser();
  const redirectInProgress = useRef(false);
  
  // Function to handle redirect to dashboard
  const redirectToDashboard = () => {
    if (redirectInProgress.current) return;
    
    redirectInProgress.current = true;
    console.log("Redirecting to dashboard");
    
    try {
      // First check if we have the wallet address in the civic context
      // Use type assertion for proper TypeScript handling
      const userWithWallet = civicUser?.user as any;
      if (userWithWallet?.solana?.address) {
        const walletAddress = userWithWallet.solana.address;
        console.log(`Redirecting to user's wallet dashboard: ${walletAddress}`);
        router.push(`/dashboard/${walletAddress}`);
        return;
      }
      
      // If not in Civic context, check if it's in our auth context
      if (user && user.walletAddress) {
        console.log(`Redirecting to user's wallet dashboard: ${user.walletAddress}`);
        router.push(`/dashboard/${user.walletAddress}`);
        return;
      }
    } catch (error) {
      console.error("Error getting user wallet address:", error);
    }
    
    // Fallback to the main dashboard if no wallet address found
    router.push('/dashboard');
  };
  
  // Enhanced redirect effect to actively monitor auth status
  useEffect(() => {
    if ((user && !redirectInProgress.current) || 
        (civicUser && civicUser.user && !redirectInProgress.current)) {
      console.log("User authenticated, redirecting to dashboard");
      redirectToDashboard();
    }
    
    // Listen for Civic auth complete events
    const handleAuthEvent = (event: Event) => {
      if ((event as CustomEvent).detail?.type === 'auth-complete') {
        console.log("Auth complete event detected, checking user status");
        // Short timeout to allow auth state to update
        setTimeout(() => {
          if (!redirectInProgress.current) {
            console.log("User authenticated after civic event, redirecting");
            redirectToDashboard();
          }
        }, 500);
      }
    };
    
    // Add event listener for Civic auth events
    window.addEventListener('civic', handleAuthEvent);
    
    return () => {
      window.removeEventListener('civic', handleAuthEvent);
    };
  }, [user, civicUser, router]);
  
  // Immediate redirect if already authenticated
  if ((user || (civicUser && civicUser.user)) && !redirectInProgress.current) {
    redirectToDashboard();
    return null;
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up for a new account with Civic
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          
          <p className="text-center text-gray-600">
            Create an account with Civic to get started. Your account will be securely managed through Civic's authentication system.
          </p>
          
          <div className="w-full">
            <UserButton />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>{" "}
            <Button 
              variant="link" 
              className="p-0" 
              onClick={() => router.push("/auth/signin")}
            >
              Sign in
            </Button>
          </div>
          <div className="text-center text-xs text-gray-500">
            <a href="https://www.civic.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center hover:underline">
              Learn more about Civic Auth
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 