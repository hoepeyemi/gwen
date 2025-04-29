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
   * Set the pin for the user, only if they don't already have one
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

  /**
   * Update the pin for the user, whether they already have one or not
   * @param userId
   * @param pin
   * @param currentPin Optional current PIN for verification
   */
  async updatePin(
    userId: number, 
    pin: string, 
    currentPin?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate inputs
      if (!userId || !pin) {
        console.error("Invalid inputs for updatePin:", { userId, pinLength: pin?.length });
        return { success: false, message: "Invalid user ID or PIN" };
      }

      // Find the user
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { id: true, hashedPin: true }
      });

      if (!user) {
        console.error("User not found for updatePin:", userId);
        return { success: false, message: "User not found" };
      }
      
      // If user has a PIN and currentPin is provided, verify it
      if (user.hashedPin && currentPin) {
        const isValid = await bcrypt.compare(currentPin, user.hashedPin);
        if (!isValid) {
          return { success: false, message: "Current PIN is incorrect" };
        }
      }
      
      // Generate hashed pin
      const hashedPin = await this.toHash(pin);
      
      // Update user with new hashed pin
      await this.db.user.update({
        where: { id: userId },
        data: { hashedPin },
      });
      
      console.log("PIN updated successfully for user", userId);
      return { success: true, message: "PIN updated successfully" };
    } catch (e) {
      console.error("Error in AuthService.updatePin:", e);
      return { success: false, message: "An error occurred while updating the PIN" };
    }
  }
}
