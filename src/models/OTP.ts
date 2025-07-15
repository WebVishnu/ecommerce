import mongoose, { Schema } from 'mongoose';

export interface IOTP {
  _id: string;
  phone: string;
  otp: string;
  attempts: number;
  expiresAt: Date;
  verificationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Phone number must be a valid 10-digit Indian mobile number'
    }
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index - automatically delete after expiration
  },
  verificationId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for performance
OTPSchema.index({ phone: 1 });
OTPSchema.index({ phone: 1, expiresAt: 1 });

// Clear existing model to force refresh (useful during development)
if (mongoose.models.OTP) {
  delete mongoose.models.OTP;
}

export default mongoose.model<IOTP>('OTP', OTPSchema); 