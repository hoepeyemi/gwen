"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ExternalLink, UserPlus } from "lucide-react";
import { UserButton } from "@civic/auth-web3/react";
import { useAuth } from "~/providers/auth-provider";

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const redirectInProgress = useRef(false);
  const [authEventReceived, setAuthEventReceived] = useState(false);
  
  // Function to handle redirect to dashboard
  const redirectToDashboard = () => {
    if (redirectInProgress.current) return;
    
    redirectInProgress.current = true;
    console.log("Redirecting to dashboard");
    
    try {
      // Look for wallet address in localStorage
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.walletAddress) {
          console.log(`Redirecting to user's wallet dashboard: ${parsedUser.walletAddress}`);
          router.push(`/dashboard/${parsedUser.walletAddress}`);
          return;
        }
      }
    } catch (error) {
      console.error("Error getting user wallet address:", error);
    }
    
    // Fallback to the main dashboard if no wallet address found
    router.push('/dashboard');
  };
  
  // Handle Civic auth events
  useEffect(() => {
    const handleCivicEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      
      if (detail?.type === 'auth-complete') {
        console.log("Civic auth-complete event detected", detail);
        setAuthEventReceived(true);
        
        // Short delay to allow user data to be processed
        setTimeout(() => {
          redirectToDashboard();
        }, 800);
      }
    };
    
    // Add event listener
    window.addEventListener('civic', handleCivicEvent);
    
    return () => {
      window.removeEventListener('civic', handleCivicEvent);
    };
  }, [router]);

  // This effect runs when auth event is received OR user state changes
  useEffect(() => {
    if ((authEventReceived || user) && !redirectInProgress.current) {
      console.log("Auth detected - preparing redirect", { authEventReceived, user: !!user });
      
      // Check every 200ms for 5 seconds to see if user data appears in localStorage
      let attempts = 0;
      const maxAttempts = 25;  // 5 seconds total (25 * 200ms)
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (attempts >= maxAttempts) {
          console.log("Max attempts reached, proceeding with redirect");
          clearInterval(checkInterval);
          redirectToDashboard();
          return;
        }
        
        try {
          const userData = localStorage.getItem("auth_user");
          if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.walletAddress) {
              console.log(`Found wallet address on attempt ${attempts}: ${parsedUser.walletAddress}`);
              clearInterval(checkInterval);
              redirectToDashboard();
              return;
            }
          }
        } catch (error) {
          console.error("Error checking local storage:", error);
        }
        
        // If we've tried a few times and still nothing, but we have a user object,
        // go ahead and redirect
        if (attempts > 10 && user && !redirectInProgress.current) {
          console.log("We have a user but no wallet address, redirecting anyway");
          clearInterval(checkInterval);
          redirectToDashboard();
        }
      }, 200);
      
      return () => {
        clearInterval(checkInterval);
      };
    }
  }, [authEventReceived, user, router]);
  
  // Immediate redirect if already authenticated
  if (user && !redirectInProgress.current) {
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