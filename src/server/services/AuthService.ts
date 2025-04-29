import { BaseService } from "~/server/services/BaseService";
import bcrypt from "bcryptjs";
import { env } from "~/env";

export class AuthService extends BaseService {
  private get saltRounds() {
    // Default to 10 if SALT_ROUNDS is not defined
    return parseInt(env.SALT_ROUNDS || "10", 10);
  }

  /**
   * Hash the password
   * @param plainPassword
   * @private
   */
  private async toHash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  /**
   * Validate the pin for the user
   * @param userId
   * @param pin
   */
  async validatePin(
    userId: number,
    pin: string,
  ): Promise<{ success: boolean }> {
    try {
      if (!userId || !pin) {
        console.error("Invalid inputs for validatePin:", { userId, pinLength: pin?.length });
        return { success: false };
      }
      
      // Find the user
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { hashedPin: true },
      });
      
      // If user doesn't exist or has no PIN
      if (!user) {
        console.error("User not found for validatePin:", userId);
        return { success: false };
      }
      
      // If user hasn't set a PIN yet
      if (!user.hashedPin) {
        console.error("User does not have a PIN set:", userId);
        return { success: false };
      }
      
      // Compare the provided PIN with the stored hash
      const isValid = await bcrypt.compare(pin, user.hashedPin);
      
      // For development mode, accept a master PIN (use with caution)
      if (!isValid && process.env.NODE_ENV === 'development' && pin === '123456') {
        console.log("DEVELOPMENT MODE: Using master PIN for user", userId);
        return { success: true };
      }
      
      return { success: isValid };
    } catch (e) {
      console.error("Error in validatePin:", e);
      return { success: false };
    }
  }

  /**
   * Set the pin for the user
   * @param userId
   * @param pin
   */
  async setPin(userId: number, pin: string): Promise<{ success: boolean }> {
    try {
      // Validate inputs
      if (!userId || !pin) {
        console.error("Invalid inputs for setPin:", { userId, pinLength: pin?.length });
        return { success: false };
      }

      // Generate hashed pin
      const hashedPin = await this.toHash(pin);

      // Check if user exists
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!user) {
        console.error("User not found for setPin:", userId);
        return { success: false };
      }
      
      // Update user with hashed pin (whether they have one already or not)
      await this.db.user.update({
        where: { id: userId },
        data: { hashedPin },
      });
      
      console.log("PIN set successfully for user", userId);
      return { success: true };
    } catch (e) {
      console.error("Error in AuthService.setPin:", e);
      return { success: false };
    }
  }
}
