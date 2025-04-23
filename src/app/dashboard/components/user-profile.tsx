"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { shortStellarAddress } from "~/lib/utils";
import { useAuth } from "~/providers/auth-provider";

export function UserProfile() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Initialize user data from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.walletAddress) {
          setWalletAddress(parsedUser.walletAddress);
        }
        // Get profile picture from localStorage if available
        if (parsedUser.picture) {
          setAvatarUrl(parsedUser.picture);
        }
      }
    } catch (error) {
      console.error("Error getting user data from localStorage:", error);
    }
  }, []);

  // Update display name when user data changes
  useEffect(() => {
    if (user) {
      // Create display name in order of preference: name > firstName > email > "User"
      if (user.name) {
        setDisplayName(user.name);
      } else if (user.firstName) {
        setDisplayName(user.firstName + (user.lastName ? ` ${user.lastName}` : ""));
      } else if (user.email) {
        // Explicitly handle the email case
        const email = user.email;
        if (typeof email === 'string') {
          // Split the email and ensure we have a valid result
          const parts = email.split("@");
          const username = parts.length > 0 ? parts[0] : "";
          // Now username is guaranteed to be a string (empty in worst case)
          setDisplayName(username || "User");
        } else {
          setDisplayName("User");
        }
      } else {
        setDisplayName("User");
      }
    }
  }, [user]);

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-9 w-9 border border-gray-200">
        <AvatarImage src={avatarUrl || ""} alt={displayName} />
        <AvatarFallback className="bg-blue-100 text-blue-800">
          {displayName ? displayName.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{displayName}</span>
        {walletAddress && (
          <span className="text-xs text-gray-500">
            {shortStellarAddress(walletAddress)}
          </span>
        )}
      </div>
    </div>
  );
} 