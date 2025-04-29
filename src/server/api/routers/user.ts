import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { AuthService } from "~/server/services/AuthService";

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
    .input(z.object({ userId: z.string().or(z.number()), pin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const authService = new AuthService(ctx.db);
        console.log("Setting PIN for user ID:", Number(input.userId));
        
        const { success } = await authService.setPin(
          Number(input.userId),
          input.pin,
        );
        
        console.log("Pin setting result:", success);
        
        if (!success) {
          return { 
            success: false, 
            message: "Failed to set PIN" 
          };
        }
        
        return { 
          success: true, 
          message: "PIN set successfully" 
        };
      } catch (error) {
        console.error("Error in setPin procedure:", error);
        
        return { 
          success: false, 
          message: "An unexpected error occurred while setting PIN" 
        };
      }
    }),
  validatePin: publicProcedure
    .input(z.object({ userId: z.string().or(z.number()), pin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authService = new AuthService(ctx.db);
      const { success } = await authService.validatePin(
        Number(input.userId),
        input.pin,
      );
      console.log("success:", success);
      if (!success) {
        throw new Error("Invalid pin");
      }
      return { success: true };
    }),
});
