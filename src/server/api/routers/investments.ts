import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Investment types enum
export enum InvestmentType {
  SAVINGS = "savings",
  STOCKS = "stocks",
  CRYPTO = "crypto"
}

// Investment risk levels enum
export enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High"
}

// Define the investment option schema
const investmentOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  returnRate: z.string(),
  risk: z.enum([RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH]),
  term: z.string(),
  minAmount: z.number(),
  details: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  considerations: z.array(z.string()).optional(),
  historicalPerformance: z.object({
    "1y": z.string(),
    "3y": z.string(),
    "5y": z.string()
  }).optional()
});

// Define the user investment schema
const userInvestmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  investmentId: z.string(),
  amount: z.number(),
  createdAt: z.date(),
  status: z.enum(["active", "withdrawn", "completed"]),
  type: z.enum([InvestmentType.SAVINGS, InvestmentType.STOCKS, InvestmentType.CRYPTO])
});

export type InvestmentOption = z.infer<typeof investmentOptionSchema>;
export type UserInvestment = z.infer<typeof userInvestmentSchema>;

// Mock data for investment options
const mockInvestmentOptions: Record<InvestmentType, InvestmentOption[]> = {
  [InvestmentType.SAVINGS]: [
    {
      id: "savings-1",
      title: "Flexible Savings",
      description: "Earn interest while maintaining access to your funds",
      returnRate: "2.5% APY",
      risk: RiskLevel.LOW,
      term: "No lock-up period",
      minAmount: 10,
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
      ]
    },
    {
      id: "savings-2",
      title: "Fixed Term Deposit",
      description: "Higher returns with a fixed commitment period",
      returnRate: "4.2% APY",
      risk: RiskLevel.LOW,
      term: "6 months",
      minAmount: 100,
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
      ]
    },
    {
      id: "savings-3",
      title: "High-Yield Savings",
      description: "Maximum returns on your stable savings",
      returnRate: "5.8% APY",
      risk: RiskLevel.MEDIUM,
      term: "12 months",
      minAmount: 500,
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
      ]
    }
  ],
  [InvestmentType.STOCKS]: [
    {
      id: "stock-1",
      title: "Global ETF Portfolio",
      description: "Diversified exposure to global equity markets",
      returnRate: "8-12% historical",
      risk: RiskLevel.MEDIUM,
      term: "Recommended 3+ years",
      minAmount: 50,
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
      }
    },
    {
      id: "stock-2",
      title: "Tech Growth Fund",
      description: "Focused on high-growth technology companies",
      returnRate: "12-18% historical",
      risk: RiskLevel.HIGH,
      term: "Recommended 5+ years",
      minAmount: 100,
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
      }
    },
    {
      id: "stock-3",
      title: "Dividend Income Fund",
      description: "Stable companies with strong dividend payouts",
      returnRate: "6-9% historical",
      risk: RiskLevel.MEDIUM,
      term: "Recommended 2+ years",
      minAmount: 100,
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
      }
    }
  ],
  [InvestmentType.CRYPTO]: [
    {
      id: "crypto-1",
      title: "Stablecoin Yield",
      description: "Earn yield on USDC and other stablecoins",
      returnRate: "7-10% APY",
      risk: RiskLevel.MEDIUM,
      term: "Flexible",
      minAmount: 10,
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
      ]
    },
    {
      id: "crypto-2",
      title: "Blue-Chip Crypto",
      description: "Exposure to established cryptocurrencies",
      returnRate: "Variable",
      risk: RiskLevel.HIGH,
      term: "Recommended 4+ years",
      minAmount: 25,
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
      }
    },
    {
      id: "crypto-3",
      title: "DeFi Yield Farming",
      description: "Participate in decentralized finance protocols",
      returnRate: "8-20% APY",
      risk: RiskLevel.HIGH,
      term: "Flexible",
      minAmount: 50,
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
      ]
    }
  ]
};

// Mock user investments
const mockUserInvestments: UserInvestment[] = [];

export const investmentsRouter = createTRPCRouter({
  // Get all investment options by type
  getInvestmentOptionsByType: publicProcedure
    .input(z.object({
      type: z.enum([InvestmentType.SAVINGS, InvestmentType.STOCKS, InvestmentType.CRYPTO])
    }))
    .query(({ input }) => {
      return mockInvestmentOptions[input.type];
    }),

  // Get all investment types
  getInvestmentTypes: publicProcedure
    .query(() => {
      return Object.values(InvestmentType);
    }),

  // Get investment option by ID
  getInvestmentOptionById: publicProcedure
    .input(z.object({
      id: z.string(),
      type: z.enum([InvestmentType.SAVINGS, InvestmentType.STOCKS, InvestmentType.CRYPTO])
    }))
    .query(({ input }) => {
      const investment = mockInvestmentOptions[input.type].find(opt => opt.id === input.id);
      
      if (!investment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Investment option not found"
        });
      }
      
      return investment;
    }),

  // Get all user investments
  getUserInvestments: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(({ input }) => {
      return mockUserInvestments.filter(inv => inv.userId === input.userId);
    }),

  // Create a new investment for a user
  createInvestment: publicProcedure
    .input(z.object({
      userId: z.string(),
      investmentId: z.string(),
      amount: z.number().min(1),
      type: z.enum([InvestmentType.SAVINGS, InvestmentType.STOCKS, InvestmentType.CRYPTO])
    }))
    .mutation(({ input }) => {
      // Get the options for this investment type
      const options = mockInvestmentOptions[input.type];
      
      if (!options) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Investment type not found"
        });
      }
      
      // Verify investment exists
      const investment = options.find(opt => opt.id === input.investmentId);
      
      if (!investment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Investment option not found"
        });
      }
      
      // Verify minimum amount
      if (input.amount < investment.minAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum investment amount is $${investment.minAmount}`
        });
      }
      
      // Create new user investment
      const newInvestment: UserInvestment = {
        id: `inv_${Math.random().toString(36).substring(2, 15)}`,
        userId: input.userId,
        investmentId: input.investmentId,
        amount: input.amount,
        createdAt: new Date(),
        status: "active",
        type: input.type
      };
      
      // Add to mock database
      mockUserInvestments.push(newInvestment);
      
      return {
        success: true,
        investment: newInvestment
      };
    }),

  // Withdraw an investment
  withdrawInvestment: publicProcedure
    .input(z.object({
      investmentId: z.string(),
      userId: z.string()
    }))
    .mutation(({ input }) => {
      const investmentIndex = mockUserInvestments.findIndex(
        inv => inv.id === input.investmentId && inv.userId === input.userId
      );
      
      if (investmentIndex === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Investment not found or not owned by user"
        });
      }
      
      // Update status to withdrawn (investmentIndex is guaranteed to be valid here)
      const investment = mockUserInvestments[investmentIndex];
      if (investment) {
        investment.status = "withdrawn";
      } else {
        // This should never happen due to the check above, but TypeScript needs this
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update investment"
        });
      }
      
      return {
        success: true,
        investment: investment
      };
    }),

  // Get investment performance for a user
  getInvestmentPerformance: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(({ input }) => {
      const userInvestments = mockUserInvestments.filter(inv => inv.userId === input.userId);
      
      // Calculate total invested
      const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Calculate invested amounts by type
      const savingsInvested = userInvestments
        .filter(inv => inv.type === InvestmentType.SAVINGS)
        .reduce((sum, inv) => sum + inv.amount, 0);
        
      const stocksInvested = userInvestments
        .filter(inv => inv.type === InvestmentType.STOCKS)
        .reduce((sum, inv) => sum + inv.amount, 0);
        
      const cryptoInvested = userInvestments
        .filter(inv => inv.type === InvestmentType.CRYPTO)
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      // Mock performance data
      return {
        totalInvested,
        currentValue: totalInvested * 1.15, // Mock 15% growth
        totalReturn: "15.0%",
        performanceByType: {
          [InvestmentType.SAVINGS]: {
            invested: savingsInvested,
            return: "4.2%"
          },
          [InvestmentType.STOCKS]: {
            invested: stocksInvested,
            return: "10.5%"
          },
          [InvestmentType.CRYPTO]: {
            invested: cryptoInvested,
            return: "25.8%"
          }
        }
      };
    })
}); 