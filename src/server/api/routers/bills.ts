import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export interface BillType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Sample bill types that will be returned from the API
const BILL_TYPES = [
  {
    id: "electricity",
    name: "Electricity",
    description: "Pay your electricity bills",
    icon: "zap",
  },
  {
    id: "water",
    name: "Water",
    description: "Pay your water utility bills",
    icon: "droplet",
  },
  {
    id: "internet",
    name: "Internet",
    description: "Pay your internet service bills",
    icon: "wifi",
  },
  {
    id: "phone",
    name: "Phone",
    description: "Pay your phone bills",
    icon: "phone",
  },
  {
    id: "rent",
    name: "Rent",
    description: "Pay your rent",
    icon: "home",
  },
  {
    id: "credit",
    name: "Credit Card",
    description: "Pay your credit card bills",
    icon: "credit-card",
  },
];

export const billsRouter = createTRPCRouter({
  // Get all available bill types
  getBillTypes: publicProcedure.query(async () => {
    return BILL_TYPES;
  }),

  // Get a specific bill by ID
  getBillById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const bill = BILL_TYPES.find(bill => bill.id === input.id);
      if (!bill) {
        throw new Error("Bill type not found");
      }
      return bill;
    }),

  // Pay a bill
  payBill: publicProcedure
    .input(
      z.object({
        billTypeId: z.string(),
        accountNumber: z.string(),
        amount: z.number().positive(),
        walletAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // In a real app, we would process the payment here
      // For now, we'll just return a mock transaction
      const billType = BILL_TYPES.find(bill => bill.id === input.billTypeId);
      if (!billType) {
        throw new Error("Bill type not found");
      }

      // Create transaction in the database
      // This mock implementation just returns a fake transaction ID
      const transactionId = `TRX${Math.floor(Math.random() * 1000000000)}`;
      
      return {
        success: true,
        transactionId,
        amount: input.amount,
        accountNumber: input.accountNumber,
        billType: billType.name,
        date: new Date().toISOString(),
      };
    }),

  // Verify a bill payment
  verifyBillPayment: publicProcedure
    .input(z.object({ transactionId: z.string() }))
    .query(async ({ input }) => {
      // Mock verification - in a real app, we would check the database
      return {
        success: true,
        transactionId: input.transactionId,
        status: "completed",
        verificationTime: new Date().toISOString(),
      };
    }),
}); 