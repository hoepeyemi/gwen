"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Check, UserPlus } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useAuth } from "~/providers/auth-provider";

interface WelcomeProps {
  isNewUser?: boolean;
  onCreateWallet?: () => void;
  onConnectWallet?: () => void;
}

export default function Welcome({
  isNewUser = true,
  onCreateWallet,
  onConnectWallet,
}: WelcomeProps) {
  const [hasCreatedWallet, setHasCreatedWallet] = useState(false);
  const { clickFeedback } = useHapticFeedback();
  const { user } = useAuth();

  const handleCreateWallet = () => {
    clickFeedback();
    setHasCreatedWallet(true);
    
    // For demonstration, we'll create a timeout to simulate
    // wallet creation. In a real app, this would call an API.
    setTimeout(() => {
      if (onCreateWallet) onCreateWallet();
    }, 2000);
  };

  const handleConnectWallet = () => {
    clickFeedback();
    if (onConnectWallet) onConnectWallet();
  };

  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <h1 className="mb-4 text-2xl font-bold">
        {isNewUser ? "Welcome to Druid!" : "Connect Your Wallet"}
      </h1>
      <p className="mb-8 text-gray-600">
        {isNewUser
          ? "Let's set up your digital wallet to send and receive payments."
          : "Connect to your existing Druid wallet."}
      </p>

      {hasCreatedWallet ? (
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-gray-600">Creating your wallet...</p>
        </div>
      ) : (
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600">
            {isNewUser
              ? "Create a digital wallet to store and transfer money securely."
              : "Connect to access your funds and transaction history."}
          </p>
        </div>
      )}

      {isNewUser ? (
        <Button
          onClick={handleCreateWallet}
          className="mb-4 w-full"
          disabled={hasCreatedWallet}
        >
          {hasCreatedWallet ? "Creating Wallet..." : "Create Wallet"}
        </Button>
      ) : (
        <Button onClick={handleConnectWallet} className="mb-4 w-full">
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
