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
      // Save user to the database
      const user = await this.db.user.findUniqueOrThrow({
        where: { id: userId },
        select: { hashedPin: true },
      });
      if (!user.hashedPin) {
        throw new Error("User does not have a pin");
      }
      const isValid = await bcrypt.compare(pin, user.hashedPin);
      return { success: isValid };
    } catch (e) {
      console.error(e);
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

      // Check if user already has a pin
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { id: true, hashedPin: true }
      });

      if (!user) {
        console.error("User not found for setPin:", userId);
        return { success: false };
      }
      
      if (user.hashedPin) {
        console.log("User already has a pin:", userId);
        return { success: false };
      }
      
      // Update user with hashed pin
      await this.db.user.update({
        where: { id: userId },
        data: { hashedPin },
      });
      
      console.log("Pin set successfully for user", userId);
      return { success: true };
    } catch (e) {
      console.error("Error in AuthService.setPin:", e);
      return { success: false };
    }
  }
}
