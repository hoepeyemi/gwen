"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "~/components/ui/card";
import PinEntry from "~/app/wallet/_components/pin";
import { useAuth } from "~/providers/auth-provider";

// Create a separate component that uses useSearchParams
function PinAuthenticationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const { user, refreshUserData } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Check if user needs to set up a PIN instead of verifying
  useEffect(() => {
    if (user) {
      // Check localStorage for the freshest user data
      try {
        const userData = localStorage.getItem("auth_user");
        if (userData) {
          const freshUser = JSON.parse(userData);
          console.log("Fresh user data from localStorage:", freshUser);
          
          if (freshUser.hashedPin === null) {
            console.log("User has no PIN set, redirecting to PIN setup");
            setNeedsSetup(true);
            
            // Redirect to PIN setup
            setTimeout(() => {
              router.replace(`/wallet/onboarding/${user.id}`);
            }, 300);
          }
        } else if (user.hashedPin === null) {
          // Fallback to context user object
          console.log("User has no PIN set (fallback check), redirecting to PIN setup");
          setNeedsSetup(true);
          
          // Redirect to PIN setup
          setTimeout(() => {
            router.replace(`/wallet/onboarding/${user.id}`);
          }, 300);
        }
      } catch (err) {
        console.error("Error checking localStorage:", err);
        // Fallback to context user object
        if (user.hashedPin === null) {
          console.log("User has no PIN set (after error), redirecting to PIN setup");
          setNeedsSetup(true);
          
          // Redirect to PIN setup
          setTimeout(() => {
            router.replace(`/wallet/onboarding/${user.id}`);
          }, 300);
        }
      }
    }
  }, [user, router]);

  const handlePinSuccess = async () => {
    if (hasRedirected) return; // Prevent double redirects
    
    setHasRedirected(true);
    console.log("PIN verification successful, redirecting to:", redirectTo);
    
    // Refresh user data from server to ensure we have the latest state
    if (user && user.id) {
      try {
        console.log("Refreshing user data after PIN verification");
        const refreshedUser = await refreshUserData(user.id);
        
        // Copy over PIN if it exists in localStorage but not in refreshed user data
        try {
          // Get the PIN from localStorage
          const storedPinData = localStorage.getItem("user_pin");
          if (storedPinData) {
            const parsedPinData = JSON.parse(storedPinData);
            
            // Get the refreshed user data
            const userData = localStorage.getItem("auth_user");
            if (userData) {
              const parsedUserData = JSON.parse(userData);
              
              // Only add PIN if it doesn't exist in user data
              if (!parsedUserData.pin && parsedPinData && parsedPinData.pin) {
                parsedUserData.pin = parsedPinData.pin;
                localStorage.setItem("auth_user", JSON.stringify(parsedUserData));
                console.log("Added PIN to auth_user from direct storage");
              }
            }
          }
        } catch (err) {
          console.error("Error syncing PIN between storages:", err);
        }
      } catch (err) {
        console.error("Error refreshing user data:", err);
        
        // Fallback to local update if server refresh fails
        try {
          const userData = localStorage.getItem("auth_user");
          if (userData) {
            const localUser = JSON.parse(userData);
            if (localUser.hashedPin === null || localUser.hashedPin === undefined) {
              localUser.hashedPin = "PIN_VERIFIED"; // Use a string value, not a boolean
              localStorage.setItem("auth_user", JSON.stringify(localUser));
              console.log("Updated local user data for PIN verification");
            }
            
            // Ensure wallet address is set
            if (!localUser.walletAddress) {
              // Generate a unique wallet address for the user
              const newAddress = `stellar:${Math.random().toString(36).substring(2, 15)}`;
              localUser.walletAddress = newAddress;
              localStorage.setItem("auth_user", JSON.stringify(localUser));
              console.log("Generated new wallet address after PIN verification:", newAddress);
            }
          }
        } catch (localErr) {
          console.error("Error updating local user data:", localErr);
        }
      }
    }
    
    // In a real app, we'd set a session token or something similar
    // For now, just redirect to the specified path
    setTimeout(() => {
      // If the redirectTo already has a query string, handle that correctly
      if (redirectTo.includes('?')) {
        // Already has query parameters
        if (redirectTo.includes('pinVerified=true')) {
          // Already has the pinVerified parameter
          router.push(redirectTo);
        } else {
          // Add the pinVerified parameter to existing query
          router.push(`${redirectTo}&pinVerified=true`);
        }
      } else {
        // No existing query parameters, add the pinVerified parameter
        router.push(`${redirectTo}?pinVerified=true`);
      }
    }, 100);
  };

  const handleCancel = () => {
    router.push("/auth/signin");
  };

  // Redirect if the user isn't authenticated
  if (!user && !isVerifying) {
    router.push("/auth/signin");
    return null;
  }
  
  // Show loading or redirection message if user needs to set up PIN
  if (needsSetup) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mb-4"></div>
          <p>You need to set up a PIN first. Redirecting to PIN setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-none shadow-lg">
        <PinEntry 
          onSuccess={handlePinSuccess} 
          onCancel={handleCancel} 
        />
      </Card>
      <p className="mt-4 text-center text-sm text-gray-500">
        Please enter your custom PIN that you created during setup
      </p>
    </div>
  );
}

// Main component with Suspense boundary
export default function PinAuthentication() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <PinAuthenticationContent />
      </Suspense>
    </div>
  );
} 