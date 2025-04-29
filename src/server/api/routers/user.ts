import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { AuthService } from "~/server/services/AuthService";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { env } from "~/env";

export const userRouter = createTRPCRouter({
  addToWaitlist: publicProcedure
    .input(z.object({ contact: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let isEmail = false;
      if (input.contact.includes("@")) {
        isEmail = true;
      }
      const user = await ctx.db.waitlist.create({
        data: {
          contact: input.contact,
          name: input.name,
          isEmail,
        },
      });
      return user;
    }),
  registerUser: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.email && !input.phone) {
        throw new Error("Either email or phone is required");
      }
      
      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });
      return user;
    }),
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      return user;
    }),
  getUserByPhone: publicProcedure
    .input(z.object({ phone: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { phone: input.phone },
      });
      return user;
    }),
  getUserById: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });
      return user;
    }),
  setPin: publicProcedure
    .input(z.object({ 
      userId: z.number(), 
      pin: z.string().length(6) 
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Hash the PIN before storing (salt rounds from env or default to 10)
        const saltRounds = Number(env.SALT_ROUNDS) || 10;
        const hashedPin = await bcrypt.hash(input.pin, saltRounds);
        
        // Update the user with the hashed PIN
        const updatedUser = await ctx.db.user.update({
          where: { id: input.userId },
          data: { hashedPin },
        });
        
        // Return success but not the hashedPin for security
        return {
          success: true,
          userId: updatedUser.id,
        };
      } catch (error) {
        console.error("Error setting PIN:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set PIN"
        });
      }
    }),
  validatePin: publicProcedure
    .input(z.object({ 
      userId: z.number(), 
      pin: z.string() 
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get the user with their hashed PIN
        const user = await ctx.db.user.findUnique({
          where: { id: input.userId },
          select: { id: true, hashedPin: true }
        });
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }
        
        // If user has no PIN set, they need to set one first
        if (!user.hashedPin) {
          return {
            success: false,
            needsSetup: true,
            message: "PIN not set up yet"
          };
        }
        
        // Compare the provided PIN with the stored hash
        const isValid = await bcrypt.compare(input.pin, user.hashedPin);
        
        // In development mode, always accept "123456" as valid
        const isDev = process.env.NODE_ENV === 'development';
        const isDevPinValid = isDev && input.pin === "123456";
        
        if (isValid || isDevPinValid) {
          return {
            success: true,
            message: "PIN validated successfully"
          };
        } else {
          return {
            success: false,
            message: "Invalid PIN"
          };
        }
      } catch (error) {
        console.error("Error validating PIN:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate PIN"
        });
      }
    }),
  getUserDetails: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            assignedGAddress: true,
            // hashedPin is intentionally not included for security
            // but we'll include a flag to show if PIN is set up
            hashedPin: true
          }
        });
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }
        
        // Transform the response to include hasPinSetup but not the actual hash
        return {
          ...user,
          hasPinSetup: !!user.hashedPin,
          hashedPin: undefined
        };
      } catch (error) {
        console.error("Error getting user details:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user details"
        });
      }
    }),
});
