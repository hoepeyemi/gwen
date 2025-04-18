"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import { useUser } from "~/providers/auth-provider";

export default function SimpleDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { user: civicUserContext } = useUser();
  const [authUser, setAuthUser] = useState<any>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("auth_user");
        if (userData) {
          setAuthUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error loading user data from localStorage:", error);
      }
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-md">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user && !authUser) {
    return (
      <div className="container mx-auto p-8 max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Not Signed In</h1>
          <p className="mb-6">Please sign in to access your dashboard.</p>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  // User is authenticated, show dashboard
  return (
    <div className="container mx-auto p-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Simple Dashboard</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">User Information</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Name:</strong> {user?.name || authUser?.name || "Not available"}</p>
            <p><strong>Email:</strong> {user?.email || authUser?.email || "Not available"}</p>
            <p><strong>Wallet Address:</strong> {user?.walletAddress || authUser?.walletAddress || "Not available"}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Civic User Context</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            <pre className="text-xs">{JSON.stringify(civicUserContext, null, 2)}</pre>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            onClick={() => router.push("/dashboard-debug")}
          >
            Go to Debug Dashboard
          </button>
          
          <button 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            onClick={() => router.push("/auth/signin")}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
} 