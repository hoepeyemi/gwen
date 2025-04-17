"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ExternalLink, LogIn } from "lucide-react";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useAuth } from "~/providers/auth-provider";

export default function SignIn() {
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
      // Check if we have a wallet address in localStorage
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

  // Function to handle Civic auth success
  const handleAuthSuccess = () => {
    console.log("Auth success callback triggered");
    setTimeout(() => {
      redirectToDashboard();
    }, 500);
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
    if ((user || civicUser?.user) && !redirectInProgress.current) {
      console.log("User authenticated, redirecting to dashboard");
      redirectToDashboard();
    }
    
    // Listen for Civic auth complete events
    const handleAuthEvent = (event: Event) => {
      if ((event as CustomEvent).detail?.type === 'auth-complete') {
        console.log("Auth complete event detected, checking user status");
        // Short timeout to allow auth state to update
        setTimeout(() => {
          redirectToDashboard();
        }, 500);
      }
    };
    
    // Add event listener for Civic auth events
    window.addEventListener('civic', handleAuthEvent);
    
    // Also listen for the specific Civic auth state changes
    if (civicUser && !civicUser.isLoading && civicUser.user && !redirectInProgress.current) {
      console.log("Civic user detected, redirecting");
      redirectToDashboard();
    }
    
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
  }, [user, civicUser, router]);

  // Immediate redirect if already authenticated
  if ((user || (civicUser && !civicUser.isLoading && civicUser.user)) && !redirectInProgress.current) {
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