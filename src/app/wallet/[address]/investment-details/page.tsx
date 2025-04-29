/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  Coins,
  PiggyBank,
  LineChart,
  DollarSign,
  Calendar,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { toast } from "react-hot-toast";

interface InvestmentOption {
  id: string;
  title: string;
  description: string;
  returnRate: string;
  risk: "Low" | "Medium" | "High";
  term: string;
  minAmount: number;
  icon: React.ReactNode;
  details?: string;
  benefits?: string[];
  considerations?: string[];
  historicalPerformance?: {
    "1y": string;
    "3y": string;
    "5y": string;
  };
}

// More detailed investment options that match the ones in the investments page
const allInvestmentOptions: Record<string, InvestmentOption[]> = {
  savings: [
    {
      id: "savings-1",
      title: "Flexible Savings",
      description: "Earn interest while maintaining access to your funds",
      returnRate: "2.5% APY",
      risk: "Low",
      term: "No lock-up period",
      minAmount: 10,
      icon: <PiggyBank className="h-6 w-6 text-blue-500" />,
      details: "Our Flexible Savings account provides a competitive interest rate while allowing you to withdraw your funds at any time without penalties. Interest is compounded daily and paid monthly.",
      benefits: [
        "No minimum balance requirement",
        "No lock-up period",
        "Withdraw anytime",
        "Interest compounded daily",
      ],
      considerations: [
        "Lower interest rate compared to fixed-term products",
        "Interest rates may change based on market conditions",
      ],
    },
    {
      id: "savings-2",
      title: "Fixed Term Deposit",
      description: "Higher returns with a fixed commitment period",
      returnRate: "4.2% APY",
      risk: "Low",
      term: "6 months",
      minAmount: 100,
      icon: <PiggyBank className="h-6 w-6 text-green-500" />,
      details: "Lock your funds for 6 months to earn a higher interest rate. Your principal and interest are guaranteed at maturity. Early withdrawal may result in penalties.",
      benefits: [
        "Higher interest rate than flexible savings",
        "Guaranteed returns",
        "No market fluctuation risk",
        "Predictable income",
      ],
      considerations: [
        "Funds locked for 6 months",
        "Early withdrawal penalties may apply",
        "Minimum deposit of $100",
      ],
    },
    {
      id: "savings-3",
      title: "High-Yield Savings",
      description: "Maximum returns on your stable savings",
      returnRate: "5.8% APY",
      risk: "Medium",
      term: "12 months",
      minAmount: 500,
      icon: <PiggyBank className="h-6 w-6 text-purple-500" />,
      details: "Our highest-yielding savings product with a 12-month commitment period. Ideal for those looking to maximize returns on their stable savings with a longer-term view.",
      benefits: [
        "Highest fixed interest rate in our savings portfolio",
        "Guaranteed returns",
        "Protection from market volatility",
        "Great for long-term planning",
      ],
      considerations: [
        "Funds locked for 12 months",
        "Higher minimum deposit of $500",
        "Early withdrawal penalties are more significant",
      ],
    },
  ],
  stocks: [
    {
      id: "stock-1",
      title: "Global ETF Portfolio",
      description: "Diversified exposure to global equity markets",
      returnRate: "8-12% historical",
      risk: "Medium",
      term: "Recommended 3+ years",
      minAmount: 50,
      icon: <LineChart className="h-6 w-6 text-blue-600" />,
      details: "A diversified portfolio of exchange-traded funds (ETFs) providing exposure to global markets, including developed and emerging economies. This portfolio offers a balance of growth and stability.",
      benefits: [
        "Global diversification reduces country-specific risks",
        "Exposure to various industries and sectors",
        "Low expense ratios compared to actively managed funds",
        "Automatic rebalancing quarterly",
      ],
      considerations: [
        "Returns are not guaranteed and may fluctuate",
        "Market risk exposure",
        "Best suited for medium to long-term investment horizons",
      ],
      historicalPerformance: {
        "1y": "9.2%",
        "3y": "10.5%",
        "5y": "8.7%",
      },
    },
    {
      id: "stock-2",
      title: "Tech Growth Fund",
      description: "Focused on high-growth technology companies",
      returnRate: "12-18% historical",
      risk: "High",
      term: "Recommended 5+ years",
      minAmount: 100,
      icon: <LineChart className="h-6 w-6 text-indigo-600" />,
      details: "This fund invests in innovative technology companies with strong growth potential. It includes established tech leaders and promising disruptors across software, hardware, fintech, and digital services.",
      benefits: [
        "Exposure to high-growth technology sectors",
        "Potential for above-market returns",
        "Access to innovation-driven companies",
        "Professional fund management",
      ],
      considerations: [
        "Higher volatility than diversified portfolios",
        "Technology sector concentration risk",
        "Longer investment horizon recommended (5+ years)",
        "Past performance is not indicative of future results",
      ],
      historicalPerformance: {
        "1y": "14.5%",
        "3y": "16.3%",
        "5y": "15.2%",
      },
    },
    {
      id: "stock-3",
      title: "Dividend Income Fund",
      description: "Stable companies with strong dividend payouts",
      returnRate: "6-9% historical",
      risk: "Medium",
      term: "Recommended 2+ years",
      minAmount: 100,
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      details: "This fund focuses on established companies with a history of consistent dividend payments. It aims to provide a steady income stream and moderate capital appreciation over time.",
      benefits: [
        "Regular income through dividend payments",
        "Lower volatility than growth-focused investments",
        "Exposure to established, stable companies",
        "Dividends can be reinvested automatically",
      ],
      considerations: [
        "Lower capital appreciation potential than growth funds",
        "Dividend payments can vary",
        "Interest rate sensitivity",
        "Tax implications of dividend income",
      ],
      historicalPerformance: {
        "1y": "7.1%",
        "3y": "8.4%",
        "5y": "7.8%",
      },
    },
  ],
  crypto: [
    {
      id: "crypto-1",
      title: "Stablecoin Yield",
      description: "Earn yield on USDC and other stablecoins",
      returnRate: "7-10% APY",
      risk: "Medium",
      term: "Flexible",
      minAmount: 10,
      icon: <Coins className="h-6 w-6 text-blue-500" />,
      details: "Earn yield on USD-pegged stablecoins like USDC, USDT, and DAI. Your funds are deployed to lending protocols and liquidity pools with established security profiles.",
      benefits: [
        "Higher yields than traditional savings accounts",
        "Protection from cryptocurrency price volatility",
        "Flexible deposits and withdrawals",
        "Interest accrues daily and compounds",
      ],
      considerations: [
        "Smart contract risks",
        "Regulatory uncertainties in the DeFi space",
        "Yield rates may fluctuate based on market conditions",
        "Not FDIC insured",
      ],
    },
    {
      id: "crypto-2",
      title: "Blue-Chip Crypto",
      description: "Exposure to established cryptocurrencies",
      returnRate: "Variable",
      risk: "High",
      term: "Recommended 4+ years",
      minAmount: 25,
      icon: <Coins className="h-6 w-6 text-orange-500" />,
      details: "Gain exposure to established cryptocurrencies like Bitcoin and Ethereum through a managed index fund. This provides digital asset diversification without managing private keys.",
      benefits: [
        "Diversified crypto exposure in a single product",
        "Institutional-grade custody solutions",
        "No technical knowledge required",
        "Automatic rebalancing to maintain target allocations",
      ],
      considerations: [
        "High price volatility",
        "Regulatory uncertainty",
        "Long-term investment recommended (4+ years)",
        "Digital asset market risks",
      ],
      historicalPerformance: {
        "1y": "35.2%",
        "3y": "-8.7%",
        "5y": "121.5%",
      },
    },
    {
      id: "crypto-3",
      title: "DeFi Yield Farming",
      description: "Participate in decentralized finance protocols",
      returnRate: "8-20% APY",
      risk: "High",
      term: "Flexible",
      minAmount: 50,
      icon: <Coins className="h-6 w-6 text-purple-500" />,
      details: "Access advanced DeFi strategies across multiple protocols to optimize yield. Your funds are allocated across lending, liquidity provision, and staking strategies based on risk-adjusted returns.",
      benefits: [
        "Potential for high yields",
        "Exposure to innovative DeFi protocols",
        "Active management to capture best opportunities",
        "Diversification across multiple DeFi strategies",
      ],
      considerations: [
        "High risk of smart contract vulnerabilities",
        "Complex DeFi protocols with various risks",
        "Yields can be volatile and change rapidly",
        "Higher gas fees for strategy adjustments",
        "Not suitable for risk-averse investors",
      ],
    },
  ],
};

// Separate the component that uses useSearchParams into its own component
function InvestmentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const investmentId = searchParams.get("id");
  const investmentType = searchParams.get("type");
  
  const [investment, setInvestment] = useState<InvestmentOption | null>(null);
  const [amount, setAmount] = useState("");
  const [sliderValue, setSliderValue] = useState([100]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (investmentId && investmentType) {
      // Type guard function to check if the type is valid
      const isValidType = (type: string): boolean => {
        return type === 'savings' || type === 'stocks' || type === 'crypto';
      };
      
      if (isValidType(investmentType)) {
        // Need to use type assertion since TypeScript can't infer from string comparison
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const options = allInvestmentOptions[investmentType as 'savings' | 'stocks' | 'crypto']!;
        
        const found = options.find(opt => opt.id === investmentId);
        if (found) {
          setInvestment(found);
          setAmount(found.minAmount.toString());
          setSliderValue([found.minAmount]);
        } else {
          // Investment not found, redirect back
          router.push("/dashboard");
        }
      } else {
        // Invalid investment type
        router.push("/dashboard");
      }
    } else {
      // Missing parameters, redirect back
      router.push("/dashboard");
    }
  }, [investmentId, investmentType, router]);

  const handleBack = () => {
    router.back();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Allow only numbers and decimal point
      setAmount(value);
      if (value) {
        const numValue = parseFloat(value);
        if (numValue >= (investment?.minAmount || 0)) {
          setSliderValue([numValue]);
        }
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    if (value && value.length > 0) {
      const sliderValue = value[0];
      if (sliderValue !== undefined) {
        setAmount(sliderValue.toString());
      }
    }
  };

  const handleInvest = () => {
    if (!investment) return;
    
    if (!amount || amount.trim() === '') {
      toast.error('Please enter an investment amount');
      return;
    }
    
    const investAmount = parseFloat(amount);
    if (isNaN(investAmount)) {
      toast.error('Please enter a valid number');
      return;
    }
    
    if (investAmount < investment.minAmount) {
      toast.error(`Minimum investment amount is $${investment.minAmount}`);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Successfully invested $${investAmount.toFixed(2)} in ${investment.title}`);
      router.push("/dashboard?investmentSuccess=true");
    }, 1500);
  };

  const getInvestmentIcon = () => {
    if (!investment) return null;
    
    switch(investmentType) {
      case "savings":
        return <PiggyBank className="h-8 w-8 text-blue-600" />;
      case "stocks":
        return <LineChart className="h-8 w-8 text-indigo-600" />;
      case "crypto":
        return <Coins className="h-8 w-8 text-orange-600" />;
      default:
        return <TrendingUp className="h-8 w-8 text-blue-600" />;
    }
  };

  const getRiskScore = (risk: "Low" | "Medium" | "High" | undefined) => {
    switch(risk) {
      case "Low": return 1;
      case "Medium": return 2;
      case "High": return 3;
      default: return 0;
    }
  };

  if (!investment) {
    return (
      <div className="container mx-auto max-w-md p-4 sm:p-8 text-center">
        <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-3 sm:mb-4"></div>
        <p className="text-sm sm:text-base">Loading investment details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-4 sm:space-y-6 p-3 sm:p-4">
      <Button variant="ghost" onClick={handleBack} className="mb-2 sm:mb-4 p-1 sm:p-2">
        <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
        <span className="text-sm sm:text-base">Back to Investments</span>
      </Button>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {getInvestmentIcon()}
            <div>
              <CardTitle className="text-xl sm:text-2xl">{investment.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-blue-100">
                {investment.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Investment Details */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Investment Details</h3>
            <p className="text-xs sm:text-sm text-gray-700">{investment.details}</p>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
              <div className="rounded-lg bg-blue-50 p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-blue-700 mb-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Return Rate</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-blue-900">{investment.returnRate}</p>
              </div>
              
              <div className="rounded-lg bg-amber-50 p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-amber-700 mb-1">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Risk Level</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-amber-900">{investment.risk}</p>
              </div>
              
              <div className="rounded-lg bg-purple-50 p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-purple-700 mb-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Term</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-purple-900">{investment.term}</p>
              </div>
              
              <div className="rounded-lg bg-green-50 p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-green-700 mb-1">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Min. Amount</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-green-900">${investment.minAmount}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Risk Analysis */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Risk Analysis</h3>
            <div className="w-full bg-gray-100 rounded-full h-3 sm:h-4">
              <div 
                className={`h-3 sm:h-4 rounded-full ${
                  getRiskScore(investment.risk) === 1 
                    ? "bg-green-500 w-1/3" 
                    : getRiskScore(investment.risk) === 2 
                      ? "bg-yellow-500 w-2/3" 
                      : "bg-red-500 w-full"
                }`}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>
          
          {/* Historical Performance (if available) */}
          {investment.historicalPerformance && (
            <>
              <Separator />
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium flex items-center">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600" />
                  Historical Performance
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <div className="text-xs text-gray-500">1 Year</div>
                    <div className="text-sm sm:text-lg font-bold text-indigo-700">
                      {investment.historicalPerformance["1y"]}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <div className="text-xs text-gray-500">3 Years</div>
                    <div className="text-sm sm:text-lg font-bold text-indigo-700">
                      {investment.historicalPerformance["3y"]}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <div className="text-xs text-gray-500">5 Years</div>
                    <div className="text-sm sm:text-lg font-bold text-indigo-700">
                      {investment.historicalPerformance["5y"]}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 italic">
                  Past performance is not indicative of future results
                </p>
              </div>
            </>
          )}
          
          {/* Benefits and Considerations */}
          {(investment.benefits || investment.considerations) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {investment.benefits && (
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-medium flex items-center">
                      <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-green-600" />
                      Benefits
                    </h3>
                    <ul className="space-y-2">
                      {investment.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-green-500 mr-1 sm:mr-2">•</span>
                          <span className="text-xs sm:text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {investment.considerations && (
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-amber-600" />
                      Considerations
                    </h3>
                    <ul className="space-y-2">
                      {investment.considerations.map((consideration, index) => (
                        <li key={index} className="flex items-start">
                          <span className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-amber-500 mr-1 sm:mr-2">•</span>
                          <span className="text-xs sm:text-sm">{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Investment Form */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Invest Now</h3>
            
            <Alert className="bg-blue-50 text-blue-800 border-blue-200 p-2 sm:p-3">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <AlertTitle className="text-xs sm:text-sm">Investment Disclaimer</AlertTitle>
              <AlertDescription className="text-xs">
                This is a demo investment. No actual funds will be transferred.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                Investment Amount (Minimum ${investment.minAmount})
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-base sm:text-lg font-bold">$</span>
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="text-base sm:text-lg font-medium"
                  placeholder="Enter amount"
                />
              </div>
              
              <Slider
                defaultValue={[investment.minAmount]}
                max={10000}
                min={investment.minAmount}
                step={10}
                value={sliderValue || [investment.minAmount]}
                onValueChange={handleSliderChange}
                className="py-4"
              />
              <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                <span>${investment.minAmount}</span>
                <span>$10,000</span>
              </div>
            </div>
            
            {/* Estimated Returns */}
            <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Estimated Returns (illustration only)
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">1 Year</p>
                  <p className="text-xs sm:text-sm font-bold text-green-600">
                    ${(() => {
                      const value = parseFloat(amount || "0");
                      return isNaN(value) ? 0 : (value * 1.05).toFixed(2);
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">3 Years</p>
                  <p className="text-xs sm:text-sm font-bold text-green-600">
                    ${(() => {
                      const value = parseFloat(amount || "0");
                      return isNaN(value) ? 0 : Math.round(value * 1.15).toFixed(0);
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">5 Years</p>
                  <p className="text-xs sm:text-sm font-bold text-green-600">
                    ${(() => {
                      const value = parseFloat(amount || "0");
                      return isNaN(value) ? 0 : Math.round(value * 1.28).toFixed(0);
                    })()}
                  </p>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 italic mt-2">
                *Based on average returns, not guaranteed
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-4 sm:p-6">
          <Button 
            className="w-full text-sm sm:text-base" 
            size="lg"
            onClick={handleInvest}
            disabled={isLoading || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) < investment.minAmount}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white rounded-full border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <span>Invest ${amount && !isNaN(parseFloat(amount)) ? parseFloat(amount).toFixed(2) : '0.00'}</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main export that wraps the content in a Suspense boundary
export default function InvestmentDetailsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-md p-4 sm:p-8 text-center">
        <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-3 sm:mb-4"></div>
        <p className="text-sm sm:text-base">Loading investment options...</p>
      </div>
    }>
      <InvestmentDetailsContent />
    </Suspense>
  );
} 