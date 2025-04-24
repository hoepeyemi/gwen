"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ExternalLink, UserPlus } from "lucide-react";
import { UserButton } from "@civic/auth-web3/react";
import { useAuth } from "~/providers/auth-provider";
import { useUser } from "~/providers/auth-provider";

export default function SignUp() {
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
        
        localStorage.setItem("auth_user", JSON.stringify(mergedUser));
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