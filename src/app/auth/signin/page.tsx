"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ExternalLink, LogIn } from "lucide-react";
import { UserButton } from "@civic/auth-web3/react";
import { useAuth } from "~/providers/auth-provider";
import { useUser } from "~/providers/auth-provider";
import { toast } from "react-hot-toast";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { user: civicUserContext } = useUser();
  const redirectInProgress = useRef(false);

  // Function to handle redirect to dashboard
  const redirectToDashboard = () => {
    if (redirectInProgress.current) return;
    
    redirectInProgress.current = true;
    console.log("Redirecting to dashboard");
    router.push('/dashboard');
  };

  // Function to handle Civic auth success
  const handleAuthSuccess = () => {
    console.log("Auth success callback triggered");
    // Clear any existing auth data to ensure we get fresh data from Civic
    localStorage.removeItem("auth_user");
    
    // Show loading indicator
    setIsLoading(true);
    toast.loading("Connecting to Civic...", { id: "civic-auth" });
    
    // Small delay to allow Civic auth to complete
    setTimeout(() => {
      // Check for Civic auth data
      const civicUser = civicUserContext?.user;
      if (civicUser) {
        console.log("Civic user authenticated:", civicUser);
        toast.success("Successfully authenticated with Civic!", { id: "civic-auth" });
      } else {
        console.log("No Civic user data found after auth");
        toast.error("Authentication incomplete", { id: "civic-auth" });
      }
      
      redirectToDashboard();
    }, 2000);
  };

  // Clear all local session data on mount to prevent authentication mismatches
  useEffect(() => {
    // Clear all civic auth-related data from local storage
    const cookiesToClear = Object.keys(localStorage).filter(key => 
      key.startsWith('civic') || 
      key.includes('auth') || 
      key.includes('session')
    );
    
    cookiesToClear.forEach(key => {
      console.log(`Clearing potential stale auth data: ${key}`);
      localStorage.removeItem(key);
    });
    
    // Clear any session storage items that might be related to auth
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('civic') || key.includes('auth') || key.includes('session')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  // Enhanced redirect effect to actively monitor auth status
  useEffect(() => {
    if (user && !redirectInProgress.current) {
      console.log("User authenticated, redirecting to dashboard");
      redirectToDashboard();
    }

    // Check civic context separately
    if (civicUserContext?.user && !redirectInProgress.current) {
      console.log("Civic user authenticated, redirecting to dashboard");
      // Save civic user data to localStorage first
      try {
        const civicUser = civicUserContext.user;
        console.log("Civic user data:", civicUser);
        console.log("Full Civic context:", civicUserContext);
        
        // Check all possible paths for wallet address
        let solanaWalletAddress = null;
        const context = civicUserContext as any;
        
        // Try different possible paths to the Solana wallet address
        if (context.solana && typeof context.solana === 'object' && context.solana.address) {
          solanaWalletAddress = context.solana.address;
          console.log("Found wallet address at context.solana.address:", solanaWalletAddress);
        } else if (civicUser && civicUser.solana && typeof civicUser.solana === 'object' && 'address' in (civicUser.solana as Record<string, any>)) {
          solanaWalletAddress = (civicUser.solana as Record<string, any>).address;
          console.log("Found wallet address at civicUser.solana.address:", solanaWalletAddress);
        } else if (context.wallet && context.wallet.publicKey) {
          solanaWalletAddress = context.wallet.publicKey.toString();
          console.log("Found wallet address at context.wallet.publicKey:", solanaWalletAddress);
        } else if (civicUser && (civicUser as any).wallet && (civicUser as any).wallet.publicKey) {
          solanaWalletAddress = (civicUser as any).wallet.publicKey.toString();
          console.log("Found wallet address at civicUser.wallet.publicKey:", solanaWalletAddress);
        }
        
        if (solanaWalletAddress) {
          console.log("Using Solana wallet address:", solanaWalletAddress);
        } else {
          console.log("No Civic Solana wallet found. The user may need to complete authentication.");
          toast.loading("Please complete wallet setup through Civic.", { duration: 5000 });
        }
        
        const userData = localStorage.getItem("auth_user") || "{}";
        const parsedUser = JSON.parse(userData);
        
        // Merge existing data with civic data
        const mergedUser = {
          ...parsedUser,
          id: parseInt(civicUser.id || parsedUser.id || '0'),
          email: civicUser.email || parsedUser.email,
          name: civicUser.name || parsedUser.name,
          picture: civicUser.picture || parsedUser.picture,
        };
        
        // Only set wallet address if we have one from Civic
        if (solanaWalletAddress) {
          mergedUser.walletAddress = solanaWalletAddress;
        }
        
        localStorage.setItem("auth_user", JSON.stringify(mergedUser));
        console.log("Updated auth_user in localStorage:", mergedUser);
      } catch (error) {
        console.error("Error saving civic user data:", error);
      }
      
      redirectToDashboard();
    }
    
    // Listen for Civic auth complete events
    const handleAuthEvent = (event: Event) => {
      if ((event as CustomEvent).detail?.type === 'auth-complete') {
        console.log("Auth complete event detected, checking user status");
        // Short timeout to allow auth state to update
        setTimeout(() => {
          const userData = localStorage.getItem("auth_user");
          if (userData && !redirectInProgress.current) {
            console.log("User data found after auth, redirecting");
            redirectToDashboard();
          }
        }, 500);
      }
    };
    
    // Add event listener for Civic auth events
    window.addEventListener('civic', handleAuthEvent);
    
    // Polling as a fallback mechanism
    const checkInterval = setInterval(() => {
      if (redirectInProgress.current) {
        clearInterval(checkInterval);
        return;
      }
      
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        console.log("User data found during polling, redirecting");
        clearInterval(checkInterval);
        redirectToDashboard();
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('civic', handleAuthEvent);
      clearInterval(checkInterval);
    };
  }, [user, civicUserContext, router]);

  // Immediate redirect if already authenticated
  if (user && !redirectInProgress.current) {
    redirectToDashboard();
    return null;
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Sign in to your account with Civic
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          
          <p className="text-center text-gray-600">
            Use your Civic authentication to securely sign in. No password required.
          </p>
          
          <div className="w-full">
            <UserButton />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{" "}
            <Button 
              variant="link" 
              className="p-0" 
              onClick={() => router.push("/auth/signup")}
            >
              Sign up
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