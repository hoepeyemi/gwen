import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock bill types for development
const BILL_TYPES = [
  {
    id: "electricity",
    name: "Electricity",
    description: "Pay your electricity bill",
    icon: "zap"
  },
  {
    id: "water",
    name: "Water",
    description: "Pay your water bill",
    icon: "droplet"
  },
  {
    id: "internet",
    name: "Internet",
    description: "Pay your internet bill",
    icon: "wifi"
  },
  {
    id: "phone",
    name: "Phone",
    description: "Pay your phone bill",
    icon: "phone"
  },
  {
    id: "tv",
    name: "TV",
    description: "Pay your TV bill",
    icon: "tv"
  },
  {
    id: "gas",
    name: "Gas",
    description: "Pay your gas bill",
    icon: "flame"
  }
];

export const billsRouter = createTRPCRouter({
  getBillTypes: publicProcedure
    .query(async () => {
      // In a real app, you would fetch these from a database
      return BILL_TYPES;
    }),

  payBill: publicProcedure
    .input(z.object({
      billId: z.string(),
      amount: z.number(),
      accountNumber: z.string(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // In a real app, you would process the payment through a payment provider
      // and store the transaction in the database
      
      // For now, just return a success response with a transaction ID
      const transactionId = `bill-payment-${Date.now()}`;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store the transaction in the database if needed
        /* 
        await ctx.db.transaction.create({
          data: {
            id: transactionId,
            type: "bill_payment",
            amount: input.amount,
            recipient: input.billId,
            accountNumber: input.accountNumber,
            address: input.address,
            status: "completed",
            createdAt: new Date(),
          },
        });
        */
        
        return {
          success: true,
          transactionId,
          message: `Successfully paid ${input.billId} bill`
        };
      } catch (error) {
        console.error("Error processing bill payment:", error);
        throw new Error("Failed to process bill payment. Please try again.");
      }
    }),
}); 