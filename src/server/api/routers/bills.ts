import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// In-memory storage for bill payments
const mockBillPayments: Array<{
  id: string;
  billTypeId: string;
  accountNumber: string;
  amount: number;
  userId?: number;
  status: string;
  paymentDate: Date;
}> = [];

export const billsRouter = createTRPCRouter({
  // Get all bill types
  getBillTypes: publicProcedure.query(async () => {
    // Return a static list of bill types
    return [
      {
        id: "electricity",
        name: "Electricity",
        description: "Pay your electricity bills",
        icon: "Zap",
      },
      {
        id: "water",
        name: "Water",
        description: "Pay your water utility bills",
        icon: "Droplet",
      },
      {
        id: "internet",
        name: "Internet",
        description: "Pay your internet service bills",
        icon: "Wifi",
      },
      {
        id: "phone",
        name: "Phone",
        description: "Pay your phone bills",
        icon: "Phone",
      },
      {
        id: "rent",
        name: "Rent",
        description: "Pay your rent",
        icon: "Home",
      },
      {
        id: "credit",
        name: "Credit Card",
        description: "Pay your credit card bills",
        icon: "CreditCard",
      },
    ];
  }),

  // Submit a bill payment
  payBill: publicProcedure
    .input(
      z.object({
        billTypeId: z.string(),
        accountNumber: z.string(),
        amount: z.number().positive(),
        userId: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Create a mock bill payment record
        const paymentId = `bill_${Date.now()}`;
        
        const billPayment = {
          id: paymentId,
          billTypeId: input.billTypeId,
          accountNumber: input.accountNumber,
          amount: input.amount,
          userId: input.userId,
          status: "completed",
          paymentDate: new Date(),
        };
        
        // Store in our in-memory array
        mockBillPayments.push(billPayment);
        
        console.log("Bill payment saved to in-memory storage", billPayment);

        // Return the payment information
        return {
          success: true,
          paymentId: paymentId,
          message: `Successfully paid ${input.billTypeId} bill of $${input.amount.toFixed(2)}`,
        };
      } catch (error) {
        console.error("Bill payment error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process bill payment. Please try again.",
          cause: error,
        });
      }
    }),

  // Get bill payment history for a user
  getPaymentHistory: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(), // For pagination
      }),
    )
    .query(async ({ input }) => {
      try {
        // Filter and sort the in-memory payments
        const filteredPayments = mockBillPayments
          .filter(payment => !input.userId || payment.userId === input.userId)
          .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
          
        // Handle pagination
        let startIndex = 0;
        if (input.cursor) {
          const cursorIndex = filteredPayments.findIndex(payment => payment.id === input.cursor);
          if (cursorIndex !== -1) {
            startIndex = cursorIndex + 1;
          }
        }
        
        const payments = filteredPayments.slice(startIndex, startIndex + input.limit + 1);

        let nextCursor: string | undefined = undefined;
        if (payments.length > input.limit) {
          const nextItem = payments.pop();
          if (nextItem) {
            nextCursor = nextItem.id;
          }
        }

        return {
          items: payments,
          nextCursor,
        };
      } catch (error) {
        console.error("Get bill payment history error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve bill payment history.",
          cause: error,
        });
      }
    }),
}); 