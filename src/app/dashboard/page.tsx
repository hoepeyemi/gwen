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
  ArrowDownToLine,
  ArrowRight
} from "lucide-react";
import { useAuth } from "~/providers/auth-provider";
import toast from "react-hot-toast";
import { UserButton } from "@civic/auth-web3/react";
import { shortStellarAddress } from "~/lib/utils";

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
    id: "tx1",
    type: "send",
    amount: 50,
    recipient: "Jane Smith",
    date: "2023-06-10",
  },
  {
    id: "tx2",
    type: "receive",
    amount: 120,
    recipient: "Alice Brown",
    date: "2023-06-07",
  },
  {
    id: "tx3",
    type: "send",
    amount: 15,
    recipient: "Bob Johnson",
    date: "2023-06-05",
  },
];

// Create a separate component that uses useSearchParams
function DashboardContent() {
  const { user, logout, refreshUserData, solanaWalletAddress } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState("673,000.56"); // Mock balance
  const router = useRouter();
  const searchParams = useSearchParams();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [redirected, setRedirected] = useState(false);
  
  // Initialize user data from localStorage
  useEffect(() => {
    console.log("🔵 Dashboard mounting");
    console.log("🔵 Auth user:", user);
    console.log("🔵 Solana wallet address from auth:", solanaWalletAddress);
    
    // Check if the pin was already verified in this session
    const pinVerified = searchParams.get("pinVerified") === "true";
    if (pinVerified) {
      setIsPinVerified(true);
      setIsVerifying(false);
    }
    
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        console.log("🔵 localStorage auth_user found");
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        console.log("🔵 Parsed user data:", parsedUser);
        
        // Prioritize solanaWalletAddress from auth, then from localStorage
        if (solanaWalletAddress) {
          console.log("🔵 Using wallet address from auth:", solanaWalletAddress);
          setWalletAddress(solanaWalletAddress);
        } else if (parsedUser.walletAddress) {
          console.log("🔵 Using wallet address from localStorage:", parsedUser.walletAddress);
          setWalletAddress(parsedUser.walletAddress);
        } else {
          console.log("🔵 No wallet address found");
        }
        
        // Check PIN verification
        if (!pinVerified) {
          // Check if user has a PIN set
          const timer = setTimeout(() => {
            // Check if hashedPin is null (no PIN set)
            if (parsedUser.hashedPin === null) {
              console.log("User has no PIN set, will redirect to PIN setup");
              if (parsedUser.id) {
                router.replace(`/wallet/onboarding/${parsedUser.id}`);
              } else {
                setIsPinVerified(true); // Skip PIN for now if no user ID
                setIsVerifying(false);
              }
              return;
            } else {
              setIsPinVerified(true);
              setIsVerifying(false);
            }
          }, 1000);
          
          return () => clearTimeout(timer);
        }
      } else {
        console.log("🔵 No auth_user in localStorage");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      setIsVerifying(false);
    }
  }, [user, solanaWalletAddress, searchParams, router]);
  
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

  // const handleSend = () => {
  //   if (walletAddress) {
  //     router.push(`/dashboard/${walletAddress}/send`);
  //   } else {
  //     toast.error("No wallet address found");
  //   }
  // };

  const handlePayBills = () => {
    if (walletAddress) {
      router.push(`/wallet/${walletAddress}/bills`);
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

  // Show loading spinner while verifying
  if (isVerifying) {
    return <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mb-4"></div>
      <p>Verifying security...</p>
    </div>;
  }
  
  // If PIN isn't verified and we haven't already redirected, redirect to PIN page
  if (!isPinVerified && !redirected && user) {
    console.log("Redirecting to PIN verification page");
    setRedirected(true); // Set flag to prevent multiple redirects
    
    // Use a setTimeout to allow the state update to complete before redirecting
    setTimeout(() => {
      router.replace("/auth/pin?redirectTo=/dashboard?pinVerified=true");
    }, 100);
    
    return <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mb-4"></div>
      <p>Redirecting to PIN verification...</p>
    </div>;
  }

  // If no user is signed in, show a message
  if (!user && !userData) {
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
    <div className="container px-4 py-4 mx-auto max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome, {userData?.firstName || userData?.name?.split(' ')[0] || "User"}
        </h1>
        <div className="flex items-center gap-2">
          <UserButton />
          <Button size="sm" variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        </div>

      {/* User Profile Card */}
      <Card className="mb-4 overflow-hidden bg-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            {userData?.picture ? (
              <img 
                src={userData.picture} 
                alt="Profile" 
                className="h-12 w-12 rounded-full mr-4 object-cover border-2 border-blue-300"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mr-4 border-2 border-blue-300">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {userData?.name || "Welcome!"}
              </h2>
              {userData?.email && (
                <p className="text-xs text-blue-200">{userData.email}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-blue-100">Current Balance</h2>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">
                ${showBalance ? balance : "••••••"}
              </p>
              <button 
                onClick={toggleBalanceVisibility}
                className="rounded-full p-1 hover:bg-blue-500"
              >
                {showBalance ? (
                  <EyeOff className="h-4 w-4 text-blue-100" />
                ) : (
                  <Eye className="h-4 w-4 text-blue-100" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="bg-blue-500 text-white hover:bg-blue-400 border-blue-400"
              disabled={!walletAddress}
              onClick={() => {
                if (walletAddress) {
                  router.push(`/wallet/${walletAddress}/send`);
                } else {
                  toast.error("Please wait while we set up your wallet address");
                }
              }}
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Send
            </Button>
            <Button 
              variant="outline" 
              className="bg-blue-500 text-white hover:bg-blue-400 border-blue-400"
              onClick={handleReceive}
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Receive
            </Button>
          </div>
          
          {walletAddress && (
            <div className="mt-4 text-center text-sm text-blue-100">
              Wallet Address: {shortStellarAddress(walletAddress)}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 mb-6">
        <Card className="cursor-pointer transition-colors hover:bg-gray-50" onClick={() => {
          if (walletAddress) {
            router.push(`/wallet/${walletAddress}/send`);
          } else {
            toast.error("No wallet address found");
          }
        }}>
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <ArrowUpRight className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Send Money</h3>
              <p className="text-sm text-gray-500">Transfer money to other users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-gray-50" onClick={handlePayBills}>
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Pay Bills</h3>
              <p className="text-sm text-gray-500">Pay your utility bills and more</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-gray-50" onClick={handleReceive}>
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <ArrowDownToLine className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Receive Money</h3>
              <p className="text-sm text-gray-500">Get paid by other users</p>
            </div>
          </CardContent>
        </Card>
            </div>

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4 pt-4">
          {transactions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Card key={tx.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tx.type === "receive" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {tx.type === "receive" ? (
                            <ArrowDown className="h-5 w-5" />
                          ) : (
                            <ArrowUp className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.recipient}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${tx.type === "receive" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "receive" ? "+" : "-"}${tx.amount}
                        </p>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="banking" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <p className="text-lg font-medium">Connect your bank account</p>
                <p className="text-sm text-gray-500">
                  Link your bank for faster transfers and withdrawals
                </p>
              </div>
              <Button 
                className="w-full"
                onClick={handleConnectBank}
              >
                Connect Bank
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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