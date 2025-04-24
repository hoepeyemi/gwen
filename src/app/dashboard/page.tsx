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
import { UserButton } from "@civic/auth-web3/react";

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
  const { user, logout, refreshUserData } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState("673,000.56"); // Mock balance
  const router = useRouter();
  const searchParams = useSearchParams();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Initialize wallet address from localStorage only on client side
  useEffect(() => {
      try {
        const userData = localStorage.getItem("auth_user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.walletAddress) {
            console.log("INITIALIZING WALLET ADDRESS FROM STORAGE:", user.walletAddress);
          setWalletAddress(user.walletAddress);
        }
        }
      } catch (error) {
        console.error("Error initializing wallet address from localStorage:", error);
      }
  }, []);
  
  // Generate wallet address if needed (only on client, after first render)
  useEffect(() => {
    const ensureWalletAddress = () => {
      if (walletAddress) return true; // Already have a wallet address
      
      try {
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
  }, [walletAddress]);
  
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
      <div className="container max-w-md mx-auto p-4 mt-8">
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
    <div className="flex min-h-screen flex-col">
      <div className="container px-4 py-2 mx-auto max-w-4xl flex-grow">
        <div className="my-4 sm:mb-6 sm:mt-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center">
            <UserButton />
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Balance Card */}
          <Card>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Balance</CardTitle>
              <Button variant="ghost" size="icon" onClick={toggleBalanceVisibility} className="h-8 w-8">
                  {showBalance ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl sm:text-3xl font-bold">
                {showBalance ? formatCurrency(balance) : "********"}
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Investment Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-semibold">Invest</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Earn 8%</p>
                      <p className="text-xs text-gray-500">Sustainable funds</p>
                    </div>
              </div>
                  <Button
                    size="sm"
                    onClick={handleInvestments}
                    className="h-8 text-xs sm:text-sm"
                  >
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Invest
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
                    <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Connect Bank</p>
                      <p className="text-xs text-gray-500">Fast transfers</p>
                    </div>
              </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleConnectBank}
                    className="h-8 text-xs sm:text-sm"
                  >
                    Connect
                  </Button>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold">Activity Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-4 pt-0">
              <div className="w-full h-[180px] sm:h-[220px]">
                <Chart />
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 w-full grid grid-cols-3">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                  <TabsTrigger value="sent" className="text-xs sm:text-sm">Sent</TabsTrigger>
                  <TabsTrigger value="received" className="text-xs sm:text-sm">Received</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="space-y-3 sm:space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${
                              transaction.type === "send"
                                ? "bg-red-100"
                                : "bg-green-100"
                            }`}
                          >
                            {transaction.type === "send" ? (
                              <ArrowUp
                                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                  transaction.type === "send"
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              />
                            ) : (
                              <ArrowDown
                                className="h-4 w-4 sm:h-5 sm:w-5 text-green-500"
                              />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none">
                              {transaction.type === "send"
                                ? `Sent to ${transaction.recipient}`
                                : `Received from ${transaction.recipient}`}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                              {transaction.date}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-xs sm:text-sm font-semibold ${
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
                  <div className="space-y-3 sm:space-y-4">
                    {transactions
                      .filter((t) => t.type === "send")
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none">
                                Sent to {transaction.recipient}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-red-500">
                            -{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="received">
                  <div className="space-y-3 sm:space-y-4">
                    {transactions
                      .filter((t) => t.type === "receive")
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none">
                                Received from {transaction.recipient}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-green-500">
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
    </div>
  );
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container px-4 py-2 mx-auto max-w-4xl">
        <div className="my-4 sm:mb-6 sm:mt-4 flex items-center justify-between">
          <div className="h-8 sm:h-10 w-32 sm:w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        
        <div className="grid gap-4 sm:gap-6">
          {/* Balance Card */}
          <div className="h-40 sm:h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Investment and Banking Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Chart */}
          <div className="h-52 sm:h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Transactions */}
          <div className="h-64 sm:h-72 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
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