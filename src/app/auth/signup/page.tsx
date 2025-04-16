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
  const authCompletedRef = useRef(false);
  
  // Debug function to log auth status
  const logAuthStatus = (source: string) => {
    console.log(`[AUTH STATUS - ${source}]`, {
      user: !!user,
      redirectInProgress: redirectInProgress.current,
      authCompleted: authCompletedRef.current,
      userData: localStorage.getItem("auth_user") ? "exists" : "null" 
    });
  };
  
  // Function to handle redirect to dashboard
  const redirectToDashboard = () => {
    if (redirectInProgress.current) return;
    
    redirectInProgress.current = true;
    console.log("[REDIRECT] Starting redirect to dashboard");
    
    try {
      // Check if we have a wallet address in localStorage
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.walletAddress) {
          console.log(`[REDIRECT] Found wallet address: ${parsedUser.walletAddress}`);
          router.push(`/dashboard/${parsedUser.walletAddress}`);
          return;
        }
      }
    } catch (error) {
      console.error("[REDIRECT] Error getting user wallet address:", error);
    }
    
    // Fallback to the main dashboard if no wallet address found
    console.log("[REDIRECT] No wallet address found, redirecting to main dashboard");
    router.push('/dashboard');
  };
  
  // Function to handle Civic auth success - modified to use force flag
  const handleAuthSuccess = (force = false) => {
    console.log("[AUTH SUCCESS] Auth success callback triggered", { force });
    logAuthStatus("handleAuthSuccess");

    if (force || !redirectInProgress.current) {
      authCompletedRef.current = true;
      setTimeout(() => {
        // Dispatch a custom event to notify other parts of the app
        const event = new CustomEvent('app-auth-complete', { 
          detail: { 
            success: true,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(event);
        
        redirectToDashboard();
      }, 500);
    }
  };
  
  // Clear all local session data on mount to prevent authentication mismatches
  useEffect(() => {
    // Only clear data if user is not already logged in
    if (!user) {
      console.log("[INIT] Clearing potential stale auth data");
      // Clear all civic auth-related data from local storage
      const cookiesToClear = Object.keys(localStorage).filter(key => 
        key.startsWith('civic') || 
        (key.includes('auth') && key !== 'auth_user') || 
        key.includes('session')
      );
      
      cookiesToClear.forEach(key => {
        console.log(`[INIT] Clearing: ${key}`);
        localStorage.removeItem(key);
      });
      
      // Clear any session storage items that might be related to auth
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('civic') || key.includes('auth') || key.includes('session')) {
          sessionStorage.removeItem(key);
        }
      });
    } else {
      console.log("[INIT] User already logged in, skipping data clearing");
    }
    
    // Set up a listener for our custom auth complete event
    const appAuthCompleteHandler = (event: Event) => {
      console.log("[CUSTOM EVENT] app-auth-complete received", (event as CustomEvent).detail);
      setTimeout(() => redirectToDashboard(), 300);
    };
    window.addEventListener('app-auth-complete', appAuthCompleteHandler);
    
    return () => {
      window.removeEventListener('app-auth-complete', appAuthCompleteHandler);
    };
  }, []);
  
  // Enhanced redirect effect to actively monitor auth status
  useEffect(() => {
    logAuthStatus("redirect effect");
    
    if (user && !redirectInProgress.current) {
      console.log("[AUTH] User authenticated, redirecting to dashboard");
      redirectToDashboard();
    }
    
    // Set up event listeners for Civic auth events
    const civicUserLoggedInHandler = () => {
      console.log("[CIVIC EVENT] User logged in event detected");
      handleAuthSuccess(true);
    };
    
    const civicAuthCompleteHandler = (event: Event) => {
      if ((event as CustomEvent).detail?.type === 'auth-complete') {
        console.log("[CIVIC EVENT] Auth complete event detected", (event as CustomEvent).detail);
        // Short timeout to allow auth state to update
        setTimeout(() => {
          const userData = localStorage.getItem("auth_user");
          if (userData && !redirectInProgress.current) {
            console.log("[CIVIC EVENT] User data found after auth, redirecting");
            handleAuthSuccess(true);
          }
        }, 300);
      }
    };
    
    // Add event listeners for Civic auth events
    window.addEventListener('civic-user-logged-in', civicUserLoggedInHandler);
    window.addEventListener('civic', civicAuthCompleteHandler);
    
    // Polling as a fallback mechanism for detecting auth completion
    const checkInterval = setInterval(() => {
      if (redirectInProgress.current) {
        clearInterval(checkInterval);
        return;
      }
      
      const userData = localStorage.getItem("auth_user");
      if (userData && !authCompletedRef.current) {
        console.log("[POLLING] User data found during polling, redirecting");
        clearInterval(checkInterval);
        handleAuthSuccess(true);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('civic-user-logged-in', civicUserLoggedInHandler);
      window.removeEventListener('civic', civicAuthCompleteHandler);
      clearInterval(checkInterval);
    };
  }, [user, router]);
  
  // Immediate redirect if already authenticated
  useEffect(() => {
    if (user && !redirectInProgress.current) {
      console.log("[IMMEDIATE CHECK] User already authenticated, redirecting immediately");
      redirectToDashboard();
    }
  }, [user]);

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