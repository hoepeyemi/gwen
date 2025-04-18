"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import { useUser } from "~/providers/auth-provider";

export default function DashboardRepair() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { user: civicUserContext } = useUser();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  
  // Initialize user data from various sources
  useEffect(() => {
    console.log("Initializing user data in repair dashboard");
    
    try {
      // Get data from Civic user context
      if (civicUserContext?.user) {
        const civicUser = civicUserContext.user;
        
        if (civicUser.name) {
          setDisplayName(civicUser.name);
        }
        
        if (civicUser.email) {
          setEmail(civicUser.email);
        }
        
        if (civicUser.picture) {
          setPicture(civicUser.picture);
        }
      }
      
      // Try to get data from localStorage as a fallback
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        if (!displayName && parsedUser.name) {
          setDisplayName(parsedUser.name);
        }
        
        if (!email && parsedUser.email) {
          setEmail(parsedUser.email);
        }
        
        if (parsedUser.walletAddress) {
          setWalletAddress(parsedUser.walletAddress);
        }
      }
    } catch (error) {
      console.error("Error initializing user data:", error);
    }
  }, [civicUserContext, displayName, email]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Not Signed In</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your dashboard.
          </p>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* User Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {picture ? (
                  <img src={picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold">
                  {displayName || "Welcome!"}
                </h1>
                {email && (
                  <p className="text-gray-500 mb-2">{email}</p>
                )}
                {walletAddress && (
                  <p className="text-xs bg-gray-100 p-2 rounded font-mono">
                    {walletAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded transition-colors">
                Send
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded transition-colors">
                Receive
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded transition-colors">
                Pay Bills
              </button>
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded transition-colors">
                Invest
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <p className="text-gray-600 mb-4">
              Manage your account settings and preferences.
            </p>
            <div className="flex flex-col gap-2">
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-left px-4 transition-colors">
                Profile Settings
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-left px-4 transition-colors">
                Security
              </button>
              <button 
                className="bg-red-100 hover:bg-red-200 p-2 rounded text-left px-4 transition-colors text-red-600"
                onClick={() => {
                  logout();
                  router.push("/auth/signin");
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Auth User Object</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Civic User Context</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(civicUserContext, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>Dashboard Repair Version &copy; {new Date().getFullYear()} Gwen</p>
        </div>
      </div>
    </div>
  );
} 