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
  User,
} from "lucide-react";
import { useAuth } from "~/providers/auth-provider";
import { useUser } from "~/providers/auth-provider";
import toast from "react-hot-toast";
import { UserButton } from "@civic/auth-web3/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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
  const { user, logout, refreshUserData, solanaWalletAddress } = useAuth();
  const { user: civicUserContext } = useUser();
  const civicUser = civicUserContext?.user;
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState("673,000.56"); // Mock balance
  const router = useRouter();
  const searchParams = useSearchParams();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string | null;
    email: string | null;
    picture: string | null;
  }>({
    name: null,
    email: null,
    picture: null,
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // Initialize user data from localStorage on mount
  useEffect(() => {
    try {
      // First check localStorage for user data
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Update profile data from localStorage
        setUserProfile({
          name: parsedUser.name || null,
          email: parsedUser.email || null,
          picture: parsedUser.picture || null,
        });
        
        // Update wallet address from localStorage if it exists
        if (parsedUser.walletAddress) {
          setWalletAddress(parsedUser.walletAddress);
        }
      }
      
      // Then check civic user if available
      if (civicUser) {
        setUserProfile(prev => ({
          name: civicUser.name || prev.name,
          email: civicUser.email || prev.email,
          picture: civicUser.picture || prev.picture,
        }));
      }
      
      // Set wallet address from context if available
      if (solanaWalletAddress) {
        setWalletAddress(solanaWalletAddress);
      }
      
      setIsLoadingAuth(false);
    } catch (error) {
      console.error("Error initializing user data:", error);
      setIsLoadingAuth(false);
    }
  }, [civicUser, solanaWalletAddress]);
  
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
      toast.error("Please connect your wallet first");
    }
  };

  const handlePayBills = () => {
    if (walletAddress) {
      router.push(`/dashboard/${walletAddress}/bills`);
    } else {
      toast.error("Please connect your wallet first");
    }
  };

  const handleConnectBank = () => {
    router.push("/banking/connect");
  };

  const handleInvestments = () => {
    if (walletAddress) {
      router.push(`/dashboard/${walletAddress}/investments`);
    } else {
      toast.error("Please connect your wallet first");
    }
  };

  const handleWallet = () => {
    if (walletAddress) {
      router.push(`/wallet/${walletAddress}`);
    } else {
      toast.error("Please connect your wallet first");
    }
  };

  const handleSignOut = () => {
    logout();
    router.push("/auth/signin");
  };

  // Render transactions in a reusable way
  const renderTransactions = (transactionsList: Transaction[]) => {
    return transactionsList.map((transaction) => (
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
          <div className="ml-2 sm:ml-3">
            <p className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[250px]">
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
    ));
  };

  // If still loading the auth state, show loading spinner
  if (isLoadingAuth) {
    return <DashboardLoading />;
  }
  
  // If no user profile is found in localStorage, show sign in message
  if (!userProfile.name && !userProfile.email) {
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
    <div className="container px-2 sm:px-4 mx-auto max-w-4xl">
      <div className="mb-4 sm:mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="mb-4">
        <CardContent className="p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mr-3 sm:mr-4">
            <AvatarImage src={userProfile.picture || undefined} />
            <AvatarFallback>
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div className="w-full sm:w-auto mt-2 sm:mt-0">
            <h2 className="text-lg sm:text-xl font-semibold">
              {userProfile.name || "Welcome!"}
            </h2>
            {userProfile.email && (
              <p className="text-gray-500 text-xs sm:text-sm">{userProfile.email}</p>
            )}
            {walletAddress ? (
              <p className="text-xs font-mono mt-1 text-gray-500 break-all">
                {walletAddress.length > 20
                  ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}`
                  : walletAddress}
              </p>
            ) : (
              <p className="text-xs mt-1 text-gray-500">
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push("/wallet")}
                >
                  Connect wallet
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4">
        {/* Balance Card */}
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-semibold">Balance</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleBalanceVisibility}>
                {showBalance ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold">
              {showBalance ? formatCurrency(balance) : "********"}
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Investment Card */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base font-semibold">Invest</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Earn 8%</p>
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
            <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base font-semibold">Banking</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Connect Bank</p>
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
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-sm sm:text-base font-semibold">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="w-full h-[150px] sm:h-[200px] md:h-[250px]">
              <Chart />
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-sm sm:text-base font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <Tabs defaultValue="all">
              <TabsList className="mb-3 sm:mb-4 w-full">
                <TabsTrigger className="flex-1" value="all">All</TabsTrigger>
                <TabsTrigger className="flex-1" value="sent">Sent</TabsTrigger>
                <TabsTrigger className="flex-1" value="received">Received</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="space-y-3 sm:space-y-4">{renderTransactions(transactions)}</div>
              </TabsContent>
              <TabsContent value="sent">
                <div className="space-y-3 sm:space-y-4">
                  {renderTransactions(transactions.filter((t) => t.type === "send"))}
                </div>
              </TabsContent>
              <TabsContent value="received">
                <div className="space-y-3 sm:space-y-4">
                  {renderTransactions(transactions.filter((t) => t.type === "receive"))}
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