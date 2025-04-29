import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateMockId } from "~/lib/client-helpers";
import { Currency } from "@prisma/client";

// Define a type for the transfer data response
interface TransferDataResponse {
  id: string;
  amount: number;
  recipientName: string;
  recipientPhone: string;
  currency: Currency | string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const transferDataRouter = createTRPCRouter({
  getAuthChallenge: publicProcedure
    .input(z.object({ publicKey: z.string() }))
    .mutation(async ({ input }) => {
      // Mock implementation for auth challenge
      return {
        transaction: "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=", // Mock XDR
        network_passphrase: "Test Network ; September 2023",
      };
    }),

  signAuthChallenge: publicProcedure
    .input(z.object({ 
        transactionXDR: z.string(),
      networkPassphrase: z.string() 
    }))
    .mutation(async () => {
      // Mock JWT token
      return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
    }),

  startAuthSession: publicProcedure
    .input(z.object({ 
        userId: z.number(),
      publicKey: z.string() 
    }))
    .mutation(async () => {
      // Create a mock session
      return { 
        id: Math.floor(Math.random() * 1000),
        success: true
      };
    }),

  saveAuthSession: publicProcedure
    .input(z.object({ 
        sessionId: z.number(),
      token: z.string() 
    }))
    .mutation(async () => {
      return { success: true };
    }),

  linkAuthSession: publicProcedure
    .input(z.object({ 
      authSessionId: z.number(),
      transferId: z.string(),
      type: z.enum(["sender", "receiver"])
    }))
    .mutation(async () => {
      return { success: true };
    }),

  saveSigner: publicProcedure
    .input(z.object({ 
      contractId: z.string(),
      signerId: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      signer: z.any().optional() 
    }))
    .mutation(async () => {
      return { success: true };
    }),

  send: publicProcedure
    .input(z.object({
      amount: z.number(),
      destination: z.string(),
      memo: z.string().optional(),
      contractId: z.string().optional()
    }))
    .mutation(async () => {
      // Mock transaction ID
      return {
          success: true,
        txId: generateMockId()
        };
    }),

  getTransferData: publicProcedure
    .input(z.object({ transferId: z.string() }))
    .query<TransferDataResponse>(async ({ ctx, input }) => {
      // Try to get real transfer data from DB
      try {
        const transfer = await ctx.db.transfer.findUnique({
          where: { id: input.transferId }
        });
        
        if (transfer) {
          return transfer as unknown as TransferDataResponse;
        }
      } catch (error) {
        console.error("Error fetching transfer:", error);
      }
      
      // Fallback to mock data
      return {
                  id: input.transferId,
        amount: 100,
        recipientName: "Jane Doe",
        recipientPhone: "+1234567890",
        currency: "USD",
                  status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),

  deposit: publicProcedure
    .input(z.object({ transferId: z.string() }))
    .mutation(async () => {
      return { success: true };
    }),
});