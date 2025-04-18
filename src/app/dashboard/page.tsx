"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chart } from "./components/chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Eye,
  EyeOff,
  Landmark,
  Mail,
  Wallet,
  Leaf,
  Receipt,
  CreditCard,
  Banknote,
} from "lucide-react";
import { useAuth } from "~/providers/auth-provider";
import toast from "react-hot-toast";
import { useUser } from "@civic/auth-web3/react";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  recipient: string;
  date: string;
}

// Mock transactions data
const transactions: Transaction[] = [
  {
    id: "1",
    type: "send",
    amount: 50,
    recipient: "Jane Smith",
    date: "2023-06-10",
  },
  {
    id: "2",
    type: "receive",
    amount: 120,
    recipient: "Alice Brown",
    date: "2023-06-07",
  },
  {
    id: "3",
    type: "send",
    amount: 15,
    recipient: "Bob Johnson",
    date: "2023-06-05",
  },
];

// Create a separate component that uses useSearchParams
function DashboardContent() {
  const { user, logout, refreshUserData, publicKey: authPublicKey } = useAuth();
  const civicUser = useUser();
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState("673,000.56"); // Mock balance
  const router = useRouter();
  const searchParams = useSearchParams();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Add debug log for auth state
  useEffect(() => {
    console.log('--- DASHBOARD AUTH STATE ---');
    console.log('Auth user:', user);
    console.log('Auth publicKey:', authPublicKey);
    console.log('Civic user:', civicUser?.user);
    
    // Check localStorage
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('Stored user:', userData);
        if (userData.walletAddress) {
          console.log('Stored wallet address:', userData.walletAddress);
        }
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
    console.log('---------------------------');
  }, [user, authPublicKey, civicUser?.user]);
  
  // Initialize wallet address from Civic context, auth context, or localStorage
  useEffect(() => {
    try {
      // Get URL path parts to see if wallet is in the URL
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 2 && pathParts[1] === 'dashboard') {
        const urlWalletAddress = pathParts[2];
        // Check that the wallet address exists and is not empty
        if (urlWalletAddress && urlWalletAddress.trim() !== '') {
          console.log("FOUND WALLET ADDRESS IN URL:", urlWalletAddress);
          setWalletAddress(urlWalletAddress);
          
          // Update user record if we have the wallet in URL but not in user
          if (user && !user.walletAddress) {
            const updatedUser = {
              ...user,
              walletAddress: urlWalletAddress
            };
            localStorage.setItem("auth_user", JSON.stringify(updatedUser));
          }
          return;
        }
      }
      
      // First priority: get from Auth context
      if (authPublicKey) {
        console.log("INITIALIZING WALLET ADDRESS FROM AUTH CONTEXT:", authPublicKey);
        setWalletAddress(authPublicKey);
        return;
      }
      
      // Second priority: get from Civic context
      const userWithWallet = civicUser?.user as any;
      if (userWithWallet?.solana?.address) {
        const walletAddr = userWithWallet.solana.address as string;
        console.log("INITIALIZING WALLET ADDRESS FROM CIVIC:", walletAddr);
        setWalletAddress(walletAddr);
        return;
      }
      
      // Third priority: get from user object
      if (user?.walletAddress) {
        console.log("INITIALIZING WALLET ADDRESS FROM USER:", user.walletAddress);
        setWalletAddress(user.walletAddress);
        return;
      }
      
      // Last priority: get from localStorage
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.walletAddress) {
          console.log("INITIALIZING WALLET ADDRESS FROM STORAGE:", parsedUser.walletAddress);
          setWalletAddress(parsedUser.walletAddress);
          return;
        }
      }
    } catch (error) {
      console.error("Error initializing wallet address:", error);
    }
  }, [civicUser, authPublicKey, user]);
  
  // Generate wallet address if needed (only on client, after first render)
  useEffect(() => {
    const ensureWalletAddress = () => {
      if (walletAddress) return true; // Already have a wallet address
      
      try {
        // If we have a Civic user but no wallet, try to create one
        const userWithWallet = civicUser?.user as any;
        if (userWithWallet && !userWithWallet?.solana?.address && userWithWallet?.createWallet) {
          // Attempt to create a wallet via Civic's API
          console.log("Creating wallet via Civic's API");
          userWithWallet.createWallet()
            .then(() => {
              console.log("Wallet created successfully!");
              // Reload to get updated context with the wallet
              window.location.reload();
            })
            .catch((error: any) => {
              console.error("Error creating wallet:", error);
            });
          return true;
        }
        
        // Fallback to localStorage and generate a random wallet address
        const userData = localStorage.getItem("auth_user");
        if (userData) {
          const localUser = JSON.parse(userData);
          if (!localUser.walletAddress) {
            // Generate a unique wallet address for the user
            const newAddress = `stellar:${Math.random().toString(36).substring(2, 15)}`;
            localUser.walletAddress = newAddress;
            localStorage.setItem("auth_user", JSON.stringify(localUser));
            console.log("WALLET ADDRESS GENERATION:", newAddress);
            setWalletAddress(newAddress);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Error ensuring wallet address:", error);
        return false;
      }
    };

    ensureWalletAddress();
  }, [walletAddress, civicUser]);
  
  // Check if user is coming from bank connection flow
  const bankConnected = searchParams.get("bankConnected") === "true";
  
  // Check if user is coming from investment success
  const investmentSuccess = searchParams.get("investmentSuccess") === "true";
  
  useEffect(() => {
    if (bankConnected) {
      toast.success("Bank account connected successfully!");
    }
    
    if (investmentSuccess) {
      toast.success("Investment successful!");
    }
  }, [bankConnected, investmentSuccess]);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const formatCurrency = (amount: string | number) => {
    return typeof amount === "string"
      ? `$${amount}`
      : `$${amount.toLocaleString()}`;
  };

  // Navigation handlers
  const handleReceive = () => {
    if (walletAddress) {
      router.push(`/wallet/${walletAddress}/receive`);
              } else {
      router.push("/receive");
    }
  };

  const handleSend = () => {
    if (walletAddress) {
      router.push(`/dashboard/${walletAddress}/send`);
    } else {
      toast.error("No wallet address found");
    }
  };

  const handlePayBills = () => {
    if (walletAddress) {
      router.push(`/dashboard/${walletAddress}/bills`);
    } else {
      toast.error("No wallet address found");
    }
  };

  const handleConnectBank = () => {
    router.push("/banking/connect");
  };

  const handleInvestments = () => {
    if (walletAddress) {
      router.push(`/dashboard/${walletAddress}/investments`);
            } else {
      toast.error("No wallet address found");
    }
  };

  const handleWallet = () => {
    if (walletAddress) {
      router.push(`/wallet/${walletAddress}`);
    } else {
      router.push("/wallet");
    }
  };

  const handleSignOut = () => {
    logout();
    router.push("/auth/signin");
  };

  // If no user is signed in, show a message
  if (!user) {
    return (
      <div className="container mt-10 max-w-md mx-auto text-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your dashboard</p>
            <Button onClick={() => router.push("/auth/signin")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto">
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center">
          {/* UserButton removed - it's now in the main app entry point */}
        </div>
        </div>

      <div className="grid gap-4">
        {/* Balance Card */}
        <Card>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Balance</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleBalanceVisibility}>
                {showBalance ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">
              {showBalance ? formatCurrency(balance) : "********"}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              <Button
                onClick={handleReceive}
                className="flex flex-col items-center h-auto py-2 text-xs"
                variant="outline"
              >
                <ArrowDown className="h-4 w-4 mb-1" />
                Receive
              </Button>
            <Button 
                onClick={handleSend}
                className="flex flex-col items-center h-auto py-2 text-xs"
              variant="outline" 
              >
                <ArrowUp className="h-4 w-4 mb-1" />
              Send
            </Button>
            <Button 
                onClick={handleWallet}
                className="flex flex-col items-center h-auto py-2 text-xs"
                variant="outline"
              >
                <Wallet className="h-4 w-4 mb-1" />
                Wallet
              </Button>
              <Button
                onClick={handlePayBills}
                className="flex flex-col items-center h-auto py-2 text-xs"
              variant="outline" 
            >
                <Receipt className="h-4 w-4 mb-1" />
                Bills
            </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investments and Banking */}
        <div className="grid grid-cols-2 gap-4">
          {/* Investment Card */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold">Invest</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Leaf className="h-6 w-6 text-green-500 mr-2" />
                  <div>
                    <p className="font-medium">Earn 8%</p>
                    <p className="text-xs text-gray-500">Sustainable funds</p>
                  </div>
            </div>
                <Button
                  size="sm"
                  onClick={handleInvestments}
                  className="h-8"
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" /> Invest
                </Button>
            </div>
          </CardContent>
        </Card>

          {/* Banking Card */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold">Banking</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Landmark className="h-6 w-6 text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium">Connect Bank</p>
                    <p className="text-xs text-gray-500">Fast transfers</p>
                  </div>
            </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleConnectBank}
                  className="h-8"
                >
                  Connect
                </Button>
            </div>
          </CardContent>
        </Card>
            </div>

        {/* Chart */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-semibold">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Chart />
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
        </TabsList>
              <TabsContent value="all">
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            transaction.type === "send"
                              ? "bg-red-100"
                              : "bg-green-100"
                          }`}
                        >
                          {transaction.type === "send" ? (
                            <ArrowUp
                              className={`h-5 w-5 ${
                                transaction.type === "send"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            />
                          ) : (
                            <ArrowDown
                              className="h-5 w-5 text-green-500"
                            />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            {transaction.type === "send"
                              ? `Sent to ${transaction.recipient}`
                              : `Received from ${transaction.recipient}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          transaction.type === "send"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {transaction.type === "send" ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
              ))}
            </div>
        </TabsContent>
              <TabsContent value="sent">
                <div className="space-y-4">
                  {transactions
                    .filter((t) => t.type === "send")
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <ArrowUp className="h-5 w-5 text-red-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              Sent to {transaction.recipient}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.date}
                </p>
              </div>
                        </div>
                        <div className="text-sm font-semibold text-red-500">
                          -{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="received">
                <div className="space-y-4">
                  {transactions
                    .filter((t) => t.type === "receive")
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <ArrowDown className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              Received from {transaction.recipient}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.date}
                  </p>
                </div>
              </div>
                        <div className="text-sm font-semibold text-green-500">
                          +{formatCurrency(transaction.amount)}
                </div>
                </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="container mt-10 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

// Export the main Dashboard component with Suspense
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
} 