import OTP from '@/models/OTP';
import { connectDB } from './mongodb';

export interface OTPRecord {
  phone: string;
  otp: string;
  attempts: number;
  expiresAt: Date;
}

export class OTPService {
  /**
   * Generate a new OTP for the given phone number
   */
  static async generateOTP(phone: string): Promise<{ success: boolean; otp?: string; message?: string }> {
    try {
      await connectDB();
      
      // Check if there's an existing OTP for this phone
      const existingOTP = await OTP.findOne({ phone });
      
      if (existingOTP) {
        // Check if we should allow resend (rate limiting)
        const timeSinceLastOtp = Date.now() - existingOTP.createdAt.getTime();
        const minInterval = 2 * 60 * 1000; // 2 minutes
        
        if (timeSinceLastOtp < minInterval) {
          const remainingTime = Math.ceil((minInterval - timeSinceLastOtp) / 1000);
          return {
            success: false,
            message: `Please wait ${remainingTime} seconds before requesting another OTP`
          };
        }
        
        // Delete existing OTP
        await OTP.deleteOne({ phone });
      }
      
      // Generate new 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      
      // Save to database
      await OTP.create({
        phone,
        otp,
        attempts: 0,
        expiresAt
      });
      
      return { success: true, otp };
      
    } catch (error) {
      console.error('Error generating OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP'
      };
    }
  }
  
  /**
   * Verify OTP for the given phone number
   */
  static async verifyOTP(phone: string, otp: string): Promise<{ 
    success: boolean; 
    message?: string; 
    record?: OTPRecord 
  }> {
    try {
      await connectDB();
      
      // Find the OTP record
      const record = await OTP.findOne({ phone });
      
      if (!record) {
        return {
          success: false,
          message: 'OTP not found. Please request a new OTP'
        };
      }
      
      // Check if OTP is expired
      if (record.expiresAt < new Date()) {
        await OTP.deleteOne({ phone });
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP'
        };
      }
      
      // Check attempt limit
      const MAX_ATTEMPTS = 3;
      if (record.attempts >= MAX_ATTEMPTS) {
        await OTP.deleteOne({ phone });
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP'
        };
      }
      
      // Verify OTP
      if (record.otp !== otp) {
        // Increment attempts
        record.attempts += 1;
        await record.save();
        
        return {
          success: false,
          message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining`
        };
      }
      
      // OTP is valid - delete the record
      await OTP.deleteOne({ phone });
      
      return {
        success: true,
        record: {
          phone: record.phone,
          otp: record.otp,
          attempts: record.attempts,
          expiresAt: record.expiresAt
        }
      };
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }
  
  /**
   * Clean up expired OTPs (optional - TTL index handles this automatically)
   */
  static async cleanupExpiredOTPs(): Promise<{ deleted: number }> {
    try {
      await connectDB();
      
      const result = await OTP.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      return { deleted: result.deletedCount || 0 };
      
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return { deleted: 0 };
    }
  }
  
  /**
   * Store verificationId for Message Central OTP validation
   */
  static async storeVerificationId(phone: string, verificationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectDB();
      
      const result = await OTP.updateOne(
        { phone },
        { verificationId }
      );
      
      if (result.modifiedCount === 0) {
        return {
          success: false,
          message: 'OTP record not found'
        };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error storing verificationId:', error);
      return {
        success: false,
        message: 'Failed to store verificationId'
      };
    }
  }

  /**
   * Get verificationId for Message Central OTP validation
   */
  static async getVerificationId(phone: string): Promise<{ success: boolean; verificationId?: string; message?: string }> {
    try {
      await connectDB();
      
      const record = await OTP.findOne({ phone });
      
      if (!record) {
        return {
          success: false,
          message: 'OTP record not found'
        };
      }
      
      return {
        success: true,
        verificationId: record.verificationId
      };
      
    } catch (error) {
      console.error('Error getting verificationId:', error);
      return {
        success: false,
        message: 'Failed to get verificationId'
      };
    }
  }

  /**
   * Get OTP statistics (for monitoring)
   */
  static async getStats(): Promise<{
    total: number;
    expired: number;
    active: number;
  }> {
    try {
      await connectDB();
      
      const now = new Date();
      const total = await OTP.countDocuments();
      const expired = await OTP.countDocuments({ expiresAt: { $lt: now } });
      const active = total - expired;
      
      return { total, expired, active };
      
    } catch (error) {
      console.error('Error getting OTP stats:', error);
      return { total: 0, expired: 0, active: 0 };
    }
  }
} 