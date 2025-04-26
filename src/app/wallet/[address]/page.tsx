"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Eye, EyeOff, ArrowDownToLine } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { shortStellarAddress } from "~/lib/utils";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  recipient: string;
  date: string;
}

// Mock transactions for demonstration
const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    type: "receive",
    amount: 50,
    recipient: "Alice Smith",
    date: "2023-06-10",
  },
  {
    id: "tx2",
    type: "receive",
    amount: 30,
    recipient: "Bob Johnson",
    date: "2023-06-05",
  },
];

export default function Wallet() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState("1,234.56"); // Mock balance
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const { address } = useParams();
  const [isPinVerified, setIsPinVerified] = useState(false);
  
  useEffect(() => {
    // In a real app, this would check a session value or token
    // For demo purposes, we'll just set a timer to simulate PIN verification
    const timer = setTimeout(() => {
      setIsPinVerified(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
    clickFeedback();
  };

  const handleReceive = () => {
    clickFeedback("medium");
    router.push(`/wallet/${address}/receive`);
  };
  // If PIN isn't verified for viewing wallet, redirect to PIN page
  if (!isPinVerified) {
    router.push(`/auth/pin?redirectTo=/wallet/${address}`);
    return <div className="flex justify-center p-8">Verifying security...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <div className="text-center">
        <p className="text-sm text-gray-500">Your Balance</p>
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-4xl font-bold">
            {showBalance ? `$${balance}` : "••••••"}
          </h1>
          <button onClick={toggleBalanceVisibility}>
            {showBalance ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {user && user.email ? `Connected with ${user.email}` : `Wallet ID: ${address ? shortStellarAddress(String(address)) : ""}`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4">
        <Button
          onClick={handleReceive}
          className="flex h-20 flex-col items-center justify-center space-y-1 bg-green-500 hover:bg-green-600"
        >
          <ArrowDownToLine className="h-6 w-6" />
          <span>Receive Money</span>
        </Button>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
        {mockTransactions.length === 0 ? (
          <p className="text-center text-gray-500">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {mockTransactions.map((tx) => (
              <Card key={tx.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tx.recipient}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-green-500">
                      +${tx.amount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
