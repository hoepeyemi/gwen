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
  const userButtonRef = useRef<HTMLDivElement>(null);
  
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

  // Function to handle auth success
  const handleAuthSuccess = () => {
    console.log("Auth success callback triggered");
    // Add a timeout to allow user data to be properly initialized
    setTimeout(() => {
      redirectToDashboard();
    }, 1000);
  };
  
  // Set up the event listener for our custom civic-button-click event
  useEffect(() => {
    const triggerCivicButton = () => {
      console.log("Custom civic-button-click event triggered");
      
      // Find and click the button inside the UserButton component
      if (userButtonRef.current) {
        const buttonElement = userButtonRef.current.querySelector('button');
        if (buttonElement) {
          console.log("Found Civic button, clicking it");
          buttonElement.click();
        } else {
          console.error("Civic button not found inside userButtonRef");
        }
      } else {
        console.error("userButtonRef is null");
      }
    };
    
    // Add the event listener
    document.addEventListener('civic-button-click', triggerCivicButton);
    
    // Clean up
    return () => {
      document.removeEventListener('civic-button-click', triggerCivicButton);
    };
  }, []);
  
  // Enhanced redirect effect to actively monitor auth status
  useEffect(() => {
    if (user && !redirectInProgress.current) {
      console.log("User authenticated, redirecting to dashboard");
      redirectToDashboard();
    }
    
    // Listen for Civic auth complete events
    const handleAuthEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("Civic event detected:", customEvent.detail);
      
      if (customEvent.detail?.type === 'auth-complete') {
        console.log("Auth complete event detected");
        handleAuthSuccess();
      }
    };
    
    // Add event listener for Civic auth events
    window.addEventListener('civic', handleAuthEvent);
    
    return () => {
      window.removeEventListener('civic', handleAuthEvent);
    };
  }, [user]);
  
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
            <Button 
              onClick={() => {
                console.log("Sign up button clicked");
                document.dispatchEvent(new CustomEvent('civic-button-click'));
              }} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Account with Civic
            </Button>
            
            {/* Hidden UserButton that will be triggered by our custom button */}
            <div className="hidden" ref={userButtonRef}>
              <UserButton />
            </div>
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