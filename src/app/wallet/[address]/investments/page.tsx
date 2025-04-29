"use client";

import { useState } from "react";
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
import { ArrowLeft, TrendingUp, DollarSign, LineChart, Coins, PiggyBank, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface InvestmentOption {
  id: string;
  title: string;
  description: string;
  returnRate: string;
  risk: "Low" | "Medium" | "High";
  term: string;
  minAmount: number;
  icon: React.ReactNode;
}

// Mock investment options
const savingsOptions: InvestmentOption[] = [
  {
    id: "savings-1",
    title: "Flexible Savings",
    description: "Earn interest while maintaining access to your funds",
    returnRate: "2.5% APY",
    risk: "Low",
    term: "No lock-up period",
    minAmount: 10,
    icon: <PiggyBank className="h-6 w-6 text-blue-500" />
  },
  {
    id: "savings-2",
    title: "Fixed Term Deposit",
    description: "Higher returns with a fixed commitment period",
    returnRate: "4.2% APY",
    risk: "Low",
    term: "6 months",
    minAmount: 100,
    icon: <PiggyBank className="h-6 w-6 text-green-500" />
  },
  {
    id: "savings-3",
    title: "High-Yield Savings",
    description: "Maximum returns on your stable savings",
    returnRate: "5.8% APY",
    risk: "Medium",
    term: "12 months",
    minAmount: 500,
    icon: <PiggyBank className="h-6 w-6 text-purple-500" />
  }
];

const stockOptions: InvestmentOption[] = [
  {
    id: "stock-1",
    title: "Global ETF Portfolio",
    description: "Diversified exposure to global equity markets",
    returnRate: "8-12% historical",
    risk: "Medium",
    term: "Recommended 3+ years",
    minAmount: 50,
    icon: <LineChart className="h-6 w-6 text-blue-600" />
  },
  {
    id: "stock-2",
    title: "Tech Growth Fund",
    description: "Focused on high-growth technology companies",
    returnRate: "12-18% historical",
    risk: "High",
    term: "Recommended 5+ years",
    minAmount: 100,
    icon: <LineChart className="h-6 w-6 text-indigo-600" />
  },
  {
    id: "stock-3",
    title: "Dividend Income Fund",
    description: "Stable companies with strong dividend payouts",
    returnRate: "6-9% historical",
    risk: "Medium",
    term: "Recommended 2+ years",
    minAmount: 100,
    icon: <DollarSign className="h-6 w-6 text-green-600" />
  }
];

const cryptoOptions: InvestmentOption[] = [
  {
    id: "crypto-1",
    title: "Stablecoin Yield",
    description: "Earn yield on USDC and other stablecoins",
    returnRate: "7-10% APY",
    risk: "Medium",
    term: "Flexible",
    minAmount: 10,
    icon: <Coins className="h-6 w-6 text-blue-500" />
  },
  {
    id: "crypto-2",
    title: "Blue-Chip Crypto",
    description: "Exposure to established cryptocurrencies",
    returnRate: "Variable",
    risk: "High",
    term: "Recommended 4+ years",
    minAmount: 25,
    icon: <Coins className="h-6 w-6 text-orange-500" />
  },
  {
    id: "crypto-3",
    title: "DeFi Yield Farming",
    description: "Participate in decentralized finance protocols",
    returnRate: "8-20% APY",
    risk: "High",
    term: "Flexible",
    minAmount: 50,
    icon: <Coins className="h-6 w-6 text-purple-500" />
  }
];

export default function InvestmentsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("savings");

  const handleBack = () => {
    router.back();
  };

  const handleInvestmentSelect = (investment: InvestmentOption) => {
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

  const renderInvestmentOptions = (options: InvestmentOption[]) => {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <Card key={option.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                {option.icon}
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

      <Tabs defaultValue="savings" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 mb-2 sm:mb-0">
          <TabsTrigger value="savings" className="text-xs sm:text-sm">Savings</TabsTrigger>
          <TabsTrigger value="stocks" className="text-xs sm:text-sm">Stocks</TabsTrigger>
          <TabsTrigger value="crypto" className="text-xs sm:text-sm">Crypto</TabsTrigger>
        </TabsList>
        
        <TabsContent value="savings" className="mt-4 sm:mt-6">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium">Savings Products</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Secure and stable ways to grow your money with minimal risk
            </p>
          </div>
          {renderInvestmentOptions(savingsOptions)}
        </TabsContent>
        
        <TabsContent value="stocks" className="mt-4 sm:mt-6">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium">Stock Market Investments</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Gain exposure to global equity markets with diversified portfolios
            </p>
          </div>
          {renderInvestmentOptions(stockOptions)}
        </TabsContent>
        
        <TabsContent value="crypto" className="mt-4 sm:mt-6">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium">Cryptocurrency Investments</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Explore digital asset opportunities with varying risk profiles
            </p>
          </div>
          {renderInvestmentOptions(cryptoOptions)}
        </TabsContent>
      </Tabs>
    </div>
  );
} 