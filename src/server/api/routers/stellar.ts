import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { Sep10 } from "~/server/services/stellar/Sep10";
import { Sep31 } from "~/server/services/stellar/Sep31";
import { handleHorizonServerError } from "~/lib/utils";
import { account, server } from "~/lib/client-helpers";
import { Sep6 } from "~/server/services/stellar/Sep6";
import { TRPCError } from "@trpc/server/unstable-core-do-not-import";
import { Sep12 } from "~/server/services/stellar/Sep12";

export const stellarRouter = createTRPCRouter({
  getAuthChallenge: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const sep10 = new Sep10("testanchor.stellar.org");
      // TODO
      console.log(`Generating challenge transaction for ${input.publicKey}`);
      return sep10.getChallengeTransaction(input.publicKey);
    }),
  getTransferData: publicProcedure
    .input(
      z.object({
        transferId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.transfer.findUnique({
        where: { id: input.transferId },
      });
    }),
  signAuthChallenge: publicProcedure
    .input(
      z.object({
        transactionXDR: z.string(),
        networkPassphrase: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const sep10 = new Sep10("testanchor.stellar.org");
      // const transaction = TransactionBuilder.fromXDR(
      //   input.transactionXDR,
      //   input.networkPassphrase,
      // );
      // // TODO
      // transaction.sign(Keypair.fromSecret(env.FREELI_DISTRIBUTOR_SECRET_KEY));
      // const xdr = transaction.toXDR();
      const token = await sep10.submitChallengeTransaction(
        input.transactionXDR,
      );
      console.log("token is:", token);
      return token;
    }),

  saveSigner: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        contractId: z.string(),
        signerId: z.string(),
      }).refine(data => data.email || data.phone, {
        message: "Either email or phone is required",
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updateData: any = {
        passkeyCAddress: input.contractId,
        passkeyKey: input.signerId,
      };

      if (input.email) {
        await ctx.db.user.update({
          where: { email: input.email },
          data: updateData,
        });
      } else if (input.phone) {
        await ctx.db.user.update({
          where: { phone: input.phone },
          data: updateData,
        });
      }
    }),
  startAuthSession: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        publicKey: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.authSession.create({
        data: {
          userId: input.userId,
          publicKey: input.publicKey,
        },
      });
    }),
  saveAuthSession: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        token: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.authSession.update({
        where: {
          id: input.sessionId,
        },
        data: {
          token: input.token,
        },
      });
    }),

  send: publicProcedure
    .input(z.object({ xdr: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = (await server.send(input.xdr)) as never;        return {
          success: true,
          result,
        };
      } catch (e) {
        // This will throw a TRPCError with the appropriate message
        handleHorizonServerError(e);
      }
    }),
  deposit: publicProcedure
    .input(z.object({ transferId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const transfer = await ctx.db.transfer.findUnique({
          where: { id: input.transferId },
        });
        if (!transfer) {
          throw new TRPCError({
            message: "Transfer not found",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        if (!transfer.senderAuthSessionId) {
          throw new TRPCError({
            message: "Transfer is not associated with an auth session",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        const authSession = await ctx.db.authSession.findFirst({
          where: { id: transfer.senderAuthSessionId },
        });

        const sep6 = new Sep6("testanchor.stellar.org");
        console.log("Initiating deposit for transfer", transfer);
        console.log("authSession", authSession);
        const deposit = await sep6.initiateDeposit({
          authToken: authSession?.token ?? "",
          formData: {
            destination_asset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            source_asset: "iso4217:USD",
            amount: Number(transfer.amount),
            account: authSession?.publicKey ?? "",
            type: "bank_account",
          },
        });
        console.log("Deposit initiated", deposit);
        await ctx.db.hostedDeposits.create({
          data: {
            amount: transfer.amount,
            transferId: input.transferId,
            userId: Number(authSession?.userId),
            sep6Id: deposit.id,
            destinationAsset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            sourceAsset: "iso4217:USD",
            type: "bank_account",
          },
        });

        return deposit;
      } catch (e) {
        console.error(e);
        // This will throw a TRPCError with the appropriate message
        throw new TRPCError({
          message: "Failed to initiate deposit",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  withdraw: publicProcedure
    .input(
      z.object({
        transferId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const transfer = await ctx.db.transfer.findUnique({
          where: { id: input.transferId },
        });
        if (!transfer) {
          throw new TRPCError({
            message: "Transfer not found",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        if (!transfer.senderAuthSessionId) {
          throw new TRPCError({
            message: "Transfer is not associated with an auth session",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        const authSession = await ctx.db.authSession.findUnique({
          where: { id: Number(transfer.receiverAuthSessionId) },
        });

        const sep6 = new Sep6("testanchor.stellar.org");
        const withdraw = await sep6.initiateWithdrawal({
          authToken: authSession?.token ?? "",
          formData: {
            source_asset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            destination_asset: "iso4217:USD",
            amount: Number(transfer.amount),
            account: authSession?.publicKey ?? "",
            type: "bank_account",
            dest: "12345",
            dest_extra: String(transfer.id),
          },
        });

        await ctx.db.hostedWithdrawals.create({
          data: {
            amount: transfer.amount,
            transferId: input.transferId,
            userId: Number(authSession?.userId),
            sep6Id: withdraw.id,
            destinationAsset: "iso4217:USD",
            sourceAsset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            type: "bank_account",
            account_number: "12345",
            roting_number: String(transfer.id),
          },
        });

        // TODO save ID and link to transfer object
        return withdraw;
      } catch (e) {
        // This will throw a TRPCError with the appropriate message
        throw new TRPCError({
          message: "Failed to initiate deposit",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  kyc: publicProcedure
    .input(
      z.object({
        type: z.string(), // "sender" | "receiver"
        transferId: z.string(),
        fields: z.object({
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          email_address: z.string().optional(),
          // file
          photo_id_front: z.string().optional(),
          photo_id_back: z.string().optional(),
          bank_number: z.string().optional(),
          bank_account_number: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let transfer = await ctx.db.transfer.findUnique({
          where: { id: input.transferId },
        });
        
        // Create a mock transfer if one doesn't exist
        if (!transfer) {
          console.log(`Transfer with ID ${input.transferId} not found, creating a mock transfer record`);
          
          // If in development mode or MOCK_KYC is true, create a mock record
          if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
            try {
              // Attempt to create a mock transfer record
              transfer = await ctx.db.transfer.create({
                data: {
                  id: input.transferId,
                  amount: 100, // Default amount
                  status: "PENDING",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  // Currency must use the enum value
                  currency: "USD",
                  currencyType: "FIAT",
                  recipientName: "Mock Recipient",
                  recipientPhone: "+10000000000",
                }
              });
              console.log("Created mock transfer record:", transfer.id);
            } catch (createError) {
              console.error("Failed to create mock transfer:", createError);
              throw new TRPCError({
                message: "Failed to create mock transfer",
                code: "INTERNAL_SERVER_ERROR",
              });
            }
          } else {
            throw new TRPCError({
              message: "Transfer not found",
              code: "NOT_FOUND",
            });
          }
        }
        
        let authSessionId = transfer.senderAuthSessionId;
        if (input.type === "receiver") {
          authSessionId = transfer.receiverAuthSessionId;
        }

        if (!authSessionId) {
          // Create a mock auth session if none exists
          if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
            console.log("Creating mock auth session");
            try {
              // Create a mock user if needed
              let mockUser = await ctx.db.user.findFirst({
                where: { email: "mock@example.com" }
              });
              
              if (!mockUser) {
                mockUser = await ctx.db.user.create({
                  data: {
                    email: "mock@example.com",
                    firstName: "Mock",
                    lastName: "User",
                    phone: "+10000000000",
                  }
                });
              }
              
              // Create a mock auth session
              const mockAuthSession = await ctx.db.authSession.create({
                data: {
                  userId: mockUser.id,
                  publicKey: "MOCK_PUBLIC_KEY",
                  token: "MOCK_AUTH_TOKEN",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              });
              
              // Update the transfer with the new auth session
              await ctx.db.transfer.update({
                where: { id: transfer.id },
                data: {
                  [input.type === "receiver" ? "receiverAuthSessionId" : "senderAuthSessionId"]: mockAuthSession.id
                }
              });
              
              authSessionId = mockAuthSession.id;
              console.log("Created mock auth session:", authSessionId);
            } catch (authError) {
              console.error("Failed to create mock auth session:", authError);
            }
          }
          
          if (!authSessionId) {
            throw new TRPCError({
              message: "Transfer is not associated with an auth session",
              code: "BAD_REQUEST",
            });
          }
        }
        
        const authSession = await ctx.db.authSession.findUnique({
          where: { id: authSessionId },
        });
        
        if (!authSession) {
          throw new TRPCError({
            message: "Auth session not found",
            code: "NOT_FOUND",
          });
        }

        if (!authSession.token) {
          throw new TRPCError({
            message: "Auth session has no token",
            code: "UNAUTHORIZED",
          });
        }

        const kycEntry = await ctx.db.kYC.findFirst({
          where: {
            authSessionId: authSessionId,
            userId: authSession.userId,
          },
        });

        // For development environment, skip actual API calls
        if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
          const mockId = kycEntry?.sep12Id || `mock-sep12-${Date.now()}`;
          
          if (!kycEntry?.sep12Id) {
            await ctx.db.kYC.create({
              data: {
                userId: authSession.userId,
                authSessionId: authSession.id,
                sep12Id: mockId,
                status: "submitted",
              },
            });
          }
          
          return mockId;
        }

        // Add the existing ID if we have one
        const fieldsToSubmit = {...input.fields};
        if (kycEntry?.sep12Id) {
          Object.assign(fieldsToSubmit, {
            id: kycEntry.sep12Id,
          });
        }

        const sep12 = new Sep12("testanchor.stellar.org");
        const { id } = await sep12.putSep12Fields({
          authToken: String(authSession.token),
          fields: fieldsToSubmit,
        });

        if (!kycEntry?.sep12Id) {
          await ctx.db.kYC.create({
            data: {
              userId: authSession.userId,
              authSessionId: authSession.id,
              sep12Id: id,
              status: "submitted",
            },
          });
        }

        return id;
      } catch (e) {
        console.error("KYC submission error:", e);
        if (e instanceof TRPCError) {
          throw e;
        }
        
        // If we're in development mode and mocking is allowed, return a mock ID
        if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
          return `mock-sep12-${Date.now()}`;
        }
        
        throw new TRPCError({
          message: "Failed to submit KYC information",
          code: "INTERNAL_SERVER_ERROR",
          cause: e,
        });
      }
    }),
  kycFileConfig: publicProcedure
    .input(
      z.object({
        type: z.string(), // "sender" | "receiver"
        transferId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let transfer = await ctx.db.transfer.findUnique({
          where: { id: input.transferId },
        });
        
        // Create a mock transfer if one doesn't exist
        if (!transfer) {
          console.log(`Transfer with ID ${input.transferId} not found, creating a mock transfer record`);
          
          // If in development mode or MOCK_KYC is true, create a mock record
          if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
            try {
              // Attempt to create a mock transfer record
              transfer = await ctx.db.transfer.create({
                data: {
                  id: input.transferId,
                  amount: 100, // Default amount
                  status: "PENDING",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  // Currency must use the enum value
                  currency: "USD",
                  currencyType: "FIAT",
                  recipientName: "Mock Recipient",
                  recipientPhone: "+10000000000",
                }
              });
              console.log("Created mock transfer record:", transfer.id);
            } catch (createError) {
              console.error("Failed to create mock transfer:", createError);
            }
          }
          
          if (!transfer) {
            throw new TRPCError({
              message: "Transfer not found",
              code: "NOT_FOUND",
            });
          }
        }
        
        let authSessionId = transfer.senderAuthSessionId;
        if (input.type === "receiver") {
          authSessionId = transfer.receiverAuthSessionId;
        }

        if (!authSessionId) {
          // Create a mock auth session if none exists
          if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
            console.log("Creating mock auth session");
            try {
              // Create a mock user if needed
              let mockUser = await ctx.db.user.findFirst({
                where: { email: "mock@example.com" }
              });
              
              if (!mockUser) {
                mockUser = await ctx.db.user.create({
                  data: {
                    email: "mock@example.com",
                    firstName: "Mock",
                    lastName: "User",
                    phone: "+10000000000",
                  }
                });
              }
              
              // Create a mock auth session
              const mockAuthSession = await ctx.db.authSession.create({
                data: {
                  userId: mockUser.id,
                  publicKey: "MOCK_PUBLIC_KEY",
                  token: "MOCK_AUTH_TOKEN",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              });
              
              // Update the transfer with the new auth session
              await ctx.db.transfer.update({
                where: { id: transfer.id },
                data: {
                  [input.type === "receiver" ? "receiverAuthSessionId" : "senderAuthSessionId"]: mockAuthSession.id
                }
              });
              
              authSessionId = mockAuthSession.id;
              console.log("Created mock auth session:", authSessionId);
            } catch (authError) {
              console.error("Failed to create mock auth session:", authError);
            }
          }
          
          if (!authSessionId) {
            throw new TRPCError({
              message: "Transfer is not associated with an auth session",
              code: "BAD_REQUEST",
            });
          }
        }
        
        const authSession = await ctx.db.authSession.findUnique({
          where: { id: authSessionId },
        });
        
        if (!authSession) {
          throw new TRPCError({
            message: "Auth session not found",
            code: "NOT_FOUND",
          });
        }

        if (!authSession.token) {
          throw new TRPCError({
            message: "Auth session has no token",
            code: "UNAUTHORIZED",
          });
        }

        const kycEntry = await ctx.db.kYC.findFirst({
          where: {
            authSessionId: authSessionId,
            userId: authSession.userId,
          },
        });
        
        // For development environment, return dummy URL and config
        if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
          // If we don't have a KYC entry, create one
          if (!kycEntry?.sep12Id) {
            const mockId = `mock-sep12-${Date.now()}`;
            await ctx.db.kYC.create({
              data: {
                userId: authSession.userId,
                authSessionId: authSession.id,
                sep12Id: mockId,
                status: "submitted",
              },
            });
          }
          
          return { 
            url: "https://example.com/mock-kyc-upload", 
            config: {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer mock-token"
              }
            } 
          };
        }

        if (!kycEntry?.sep12Id) {
          throw new TRPCError({
            message: "KYC not submitted, please submit KYC information first",
            code: "BAD_REQUEST",
          });
        }

        const sep12 = new Sep12("testanchor.stellar.org");
        const { url, config } = await sep12.getKYCRequestConfigForFiles({
          authToken: String(authSession.token),
        });

        return { url, config };
      } catch (e) {
        console.error("KYC file config error:", e);
        if (e instanceof TRPCError) {
          throw e;
        }
        
        // If we're in development mode and mocking is allowed, return a mock config
        if (process.env.NODE_ENV === 'development' || process.env.MOCK_KYC === 'true') {
          return { 
            url: "https://example.com/mock-kyc-upload", 
            config: {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer mock-token"
              }
            } 
          };
        }
        
        throw new TRPCError({
          message: "Failed to get KYC file upload configuration",
          code: "INTERNAL_SERVER_ERROR",
          cause: e,
        });
      }
    }),
  linkAuthSession: publicProcedure
    .input(
      z.object({
        authSessionId: z.number(),
        transferId: z.string(),
        type: z.string(), // "sender" | "receiver"
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const transfer = await ctx.db.transfer.findUnique({
        where: { id: input.transferId },
      });
      if (!transfer) {
        throw new TRPCError({
          message: "Transfer not found",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      const authSession = await ctx.db.authSession.findUniqueOrThrow({
        where: { id: input.authSessionId },
      });

      if (input.type === "receiver") {
        await ctx.db.transfer.update({
          where: { id: input.transferId },
          data: {
            receiverAuthSessionId: authSession.id,
          },
        });
      } else {
        await ctx.db.transfer.update({
          where: { id: input.transferId },
          data: {
            senderAuthSessionId: authSession.id,
          },
        });
      }
    }),
});
