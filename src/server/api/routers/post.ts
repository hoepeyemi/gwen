import { z } from "zod";
import { Twilio } from "twilio";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

async function sendSms(to: string, text: string) {
  // Read Twilio credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN; 
  
  // Check if we're in development mode or if SMS is disabled
  const isDev = process.env.NODE_ENV === 'development';
  const isSmsEnabled = String(env.ENABLE_SMS) === "true";
  
  // If credentials are missing but we're in dev mode, just mock the SMS sending
  if ((!accountSid || !authToken) && isDev) {
    console.log('MOCK SMS SENDING (Development mode):', { to, text });
    return { success: true, messageId: 'mock-message-id', mock: true };
  }
  
  // If SMS is not enabled, just return success without sending
  if (!isSmsEnabled) {
    console.log('SMS DISABLED:', { to, text });
    return { success: true, messageId: 'disabled', disabled: true };
  }
  
  // If credentials are missing in production, log error
  if (!accountSid || !authToken) {
    console.error("Twilio credentials are not configured");
    throw new Error("Twilio credentials are not configured");
  }
  
  // Proceed with real SMS sending
  const client = new Twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER || "+12135148760", // Fallback to hardcoded number if env not set
      body: text,
    });
    console.log("Message sent:", message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export const postRouter = createTRPCRouter({
  otp: publicProcedure
    .input(z.object({ phone: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate OTP code - use a fixed code in development for easier testing
        const isDev = process.env.NODE_ENV === 'development';
        const otp = isDev ? "000000" : Math.floor(100000 + Math.random() * 900000).toString();
        
        // Find or create user
        let user = await ctx.db.user.findUnique({
          where: {
            phone: input.phone,
          },
        });
        
        if (!user) {
          user = await ctx.db.user.create({
            data: {
              phone: input.phone,
            },
          });
        }
        
        // Try to send SMS, but handle errors gracefully
        try {
          await sendSms(input.phone, `Your Druidapp OTP is: ${otp}`);
        } catch (error) {
          console.error("Failed to send SMS:", error);
          // In development, continue even if SMS fails
          if (process.env.NODE_ENV !== 'development') {
            if (error instanceof Error && error.message.includes("not configured")) {
              throw new Error("SMS service is not properly configured. Please contact support.");
            } else {
              throw new Error("Failed to send verification code. Please try again.");
            }
          } else {
            console.log("Development mode: Continuing despite SMS failure");
          }
        }
        
        // Store the OTP in database
        await ctx.db.oTPVerification.upsert({
          where: {
            userId: user.id,
          },
          create: {
            userId: user.id,
            otpCode: otp,
            verified: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          },
          update: {
            otpCode: otp,
            verified: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          },
        });
        
        // In development, return the OTP for easier testing
        return isDev ? otp : "OTP sent successfully";
      } catch (error) {
        console.error("OTP generation error:", error);
        throw error;
      }
    }),
  verifyOtp: publicProcedure
    .input(z.object({ phone: z.string(), otp: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get user by phone
        const user = await ctx.db.user.findUnique({
          where: {
            phone: input.phone,
          },
        });
        
        if (!user) {
          throw new Error("User not found. Please request a new verification code.");
        }
        
        // Always allow "000000" as a valid OTP for testing in any environment
        // This is useful for demos and testing on Vercel
        if (input.otp === "000000") {
          console.log("DEMO MODE: Accepting default OTP code 000000");
          return user;
        }
        
        // Find verification record
        const verification = await ctx.db.oTPVerification.findFirst({
          where: {
            userId: user.id,
            otpCode: input.otp,
            verified: false,
            expiresAt: {
              gte: new Date(),
            },
          },
        });
        
        if (!verification) {
          console.error("OTP verification failed:", { 
            userId: user.id,
            inputOtp: input.otp,
            phone: input.phone,
            timestamp: new Date().toISOString()
          });
          throw new Error("Invalid or expired verification code");
        }
        
        // Mark as verified
        await ctx.db.oTPVerification.update({
          where: {
            id: verification.id,
          },
          data: {
            verified: true,
          },
        });
        
        return user;
      } catch (error) {
        console.error("OTP verification error:", error);
        throw error;
      }
    }),
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Create a placeholder implementation that returns something
      return { success: true, message: `Created ${input.name}` };
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    return null;
  }),
});