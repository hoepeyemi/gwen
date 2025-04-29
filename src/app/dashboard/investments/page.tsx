"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  LineChart, 
  Coins, 
  PiggyBank, 
  Info,
  PieChart,
  BarChart3
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useAuth } from "~/providers/auth-provider";
import { api } from "~/trpc/react";
import { InvestmentType } from "~/server/api/routers/investments";
import toast from "react-hot-toast";

export default function InvestmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<InvestmentType>(InvestmentType.SAVINGS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch investment options for the selected type
  const investmentOptions = api.investments.getInvestmentOptionsByType.useQuery(
    { type: selectedTab },
    { enabled: !!user }
  );
  
  // Fetch user's investments
  const userInvestments = api.investments.getUserInvestments.useQuery(
    { userId: user?.id ? String(user.id) : "" },
    { enabled: !!user?.id }
  );
  
  // Fetch investment performance
  const investmentPerformance = api.investments.getInvestmentPerformance.useQuery(
    { userId: user?.id ? String(user.id) : "" },
    { enabled: !!user?.id }
  );
  
  useEffect(() => {
    // Set loading state based on queries
    setIsLoading(
      investmentOptions.isLoading || 
      userInvestments.isLoading || 
      investmentPerformance.isLoading
    );
  }, [investmentOptions.isLoading, userInvestments.isLoading, investmentPerformance.isLoading]);
  
  const handleBack = () => {
    router.back();
  };

  const handleInvestmentSelect = (investment: any) => {
    router.push(`/dashboard/investment-details?id=${investment.id}&type=${selectedTab}`);
  };

  const getRiskClass = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getInvestmentTypeIcon = (type: InvestmentType) => {
    switch (type) {
      case InvestmentType.SAVINGS:
        return <PiggyBank className="h-5 w-5 text-blue-500" />;
      case InvestmentType.STOCKS:
        return <LineChart className="h-5 w-5 text-indigo-600" />;
      case InvestmentType.CRYPTO:
        return <Coins className="h-5 w-5 text-orange-500" />;
    }
  };

  const renderInvestmentOptions = (options: any[] = []) => {
    if (options.length === 0 && isLoading) {
      return (
        <div className="grid gap-4 grid-cols-1 h-60 place-items-center">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mb-4"></div>
            <p className="text-gray-500">Loading investment options...</p>
          </div>
        </div>
      );
    }
    
    if (options.length === 0) {
      return (
        <div className="grid gap-4 grid-cols-1 h-40 place-items-center">
          <div className="text-center">
            <p className="text-gray-500">No investment options available</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <Card key={option.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                {getInvestmentTypeIcon(selectedTab)}
                <div className={`text-xs rounded-full px-2 py-1 font-medium ${getRiskClass(option.risk)}`}>
                  {option.risk} Risk
                </div>
              </div>
              <CardTitle className="text-base sm:text-lg mt-2">{option.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-2">{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs sm:text-sm pb-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Return Rate:</span>
                <span className="font-medium">{option.returnRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Minimum:</span>
                <span className="font-medium">${option.minAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Term:</span>
                <span className="font-medium">{option.term}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-sm" 
                onClick={() => handleInvestmentSelect(option)}
              >
                Invest Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderInvestmentSummary = () => {
    const performance = investmentPerformance.data;
    const investments = userInvestments.data || [];
    
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>
      );
    }
    
    if (!performance || investments.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Investment Portfolio</CardTitle>
            <CardDescription>
              You don't have any investments yet. Start investing to see your portfolio here.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-center py-8">
              <PieChart className="h-16 w-16 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-gray-500">Total Invested</p>
                <p className="text-xl font-bold text-blue-700">${performance.totalInvested.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-gray-500">Current Value</p>
                <p className="text-xl font-bold text-green-700">${performance.currentValue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-xs text-gray-500">Total Return</p>
                <p className="text-xl font-bold text-purple-700">{performance.totalReturn}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs text-gray-500">Active Investments</p>
                <p className="text-xl font-bold text-amber-700">{investments.filter(inv => inv.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Investments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {investments.map((investment) => {
              // Find the investment option details
              const option = investmentOptions.data?.find(opt => opt.id === investment.investmentId);
              
              return (
                <div key={investment.id} className="mb-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getInvestmentTypeIcon(investment.type)}
                      <div>
                        <p className="font-medium">{option?.title || "Investment"}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(investment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${investment.amount.toFixed(2)}</p>
                      <p className={`text-xs ${investment.status === "active" ? "text-green-600" : "text-amber-600"}`}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-4 sm:space-y-6 p-3 sm:p-4">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-2 p-1 sm:p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Investments</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 p-1 sm:p-2">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs sm:text-sm">Investment products involve risk and may not be suitable for all investors. Past performance is not indicative of future results.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold flex items-center">
          <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Grow Your Money
        </h2>
        <p className="mt-2 text-sm sm:text-base">
          Invest your funds and watch them grow over time. Choose from various investment options based on your risk tolerance and financial goals.
        </p>
      </div>
      
      {userInvestments.data && userInvestments.data.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
            <PieChart className="mr-2 h-5 w-5 text-blue-600" />
            Your Portfolio
          </h2>
          {renderInvestmentSummary()}
        </div>
      )}

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
          Investment Opportunities
        </h2>
        
        <Tabs 
          defaultValue={InvestmentType.SAVINGS} 
          value={selectedTab} 
          onValueChange={(value) => setSelectedTab(value as InvestmentType)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-2 sm:mb-0">
            <TabsTrigger value={InvestmentType.SAVINGS} className="text-xs sm:text-sm">Savings</TabsTrigger>
            <TabsTrigger value={InvestmentType.STOCKS} className="text-xs sm:text-sm">Stocks</TabsTrigger>
            <TabsTrigger value={InvestmentType.CRYPTO} className="text-xs sm:text-sm">Crypto</TabsTrigger>
          </TabsList>
          
          <TabsContent value={InvestmentType.SAVINGS} className="mt-4 sm:mt-6">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-medium">Savings Products</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Secure and stable ways to grow your money with minimal risk
              </p>
            </div>
            {renderInvestmentOptions(investmentOptions.data)}
          </TabsContent>
          
          <TabsContent value={InvestmentType.STOCKS} className="mt-4 sm:mt-6">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-medium">Stock Market Investments</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Gain exposure to global equity markets with diversified portfolios
              </p>
            </div>
            {renderInvestmentOptions(investmentOptions.data)}
          </TabsContent>
          
          <TabsContent value={InvestmentType.CRYPTO} className="mt-4 sm:mt-6">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-medium">Cryptocurrency Investments</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Explore digital assets with various risk-return profiles
              </p>
            </div>
            {renderInvestmentOptions(investmentOptions.data)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 