"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { shortStellarAddress } from "~/lib/utils";
import { useAuth } from "~/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { UserProfile } from "~/app/dashboard/components/user-profile";

export default function WalletTest() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  
  // Add a log entry
  const log = (message: string) => {
    setActionLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("auth_user");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        if (parsedData.walletAddress) {
          setWalletAddress(parsedData.walletAddress);
          log(`Loaded wallet address: ${parsedData.walletAddress}`);
        } else {
          log("No wallet address found in localStorage");
        }
      } else {
        log("No user data found in localStorage");
      }
    } catch (error) {
      log(`Error loading data: ${error}`);
    }
  }, []);
  
  // Generate a new wallet address
  const generateWalletAddress = () => {
    try {
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const user = JSON.parse(userData);
        const newAddress = user.id ? 
          `G${Math.random().toString(36).substring(2, 10)}${user.id}${Math.random().toString(36).substring(2, 6)}` :
          `G${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`;
        
        user.walletAddress = newAddress;
        localStorage.setItem("auth_user", JSON.stringify(user));
        
        setWalletAddress(newAddress);
        setUserData(user);
        log(`Generated new wallet address: ${newAddress}`);
      } else {
        log("Cannot generate wallet address: No user data found");
      }
    } catch (error) {
      log(`Error generating wallet address: ${error}`);
    }
  };
  
  // Reset wallet address
  const resetWalletAddress = () => {
    try {
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const user = JSON.parse(userData);
        delete user.walletAddress;
        localStorage.setItem("auth_user", JSON.stringify(user));
        
        setWalletAddress(null);
        setUserData(user);
        log("Wallet address reset successfully");
      }
    } catch (error) {
      log(`Error resetting wallet address: ${error}`);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2 text-center">Not Signed In</h2>
            <p className="text-gray-600 mb-4 text-center">Please sign in to test wallet functionality</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl">Wallet Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfile />
          
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Current Wallet Address:</p>
              {walletAddress ? (
                <>
                  <p className="text-xs break-all mt-1">{walletAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">Shortened: {shortStellarAddress(walletAddress)}</p>
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-1">No wallet address set</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button size="sm" onClick={generateWalletAddress}>
                Generate New Address
              </Button>
              <Button size="sm" variant="outline" onClick={resetWalletAddress}>
                Reset Address
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Action Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-2 rounded-md h-40 overflow-y-auto text-xs">
            {actionLog.length === 0 ? (
              <p className="text-gray-500">No actions logged yet</p>
            ) : (
              actionLog.map((log, index) => (
                <p key={index} className="mb-1">{log}</p>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 