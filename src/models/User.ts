import mongoose, { Schema } from 'mongoose';

export interface IAddress {
  _id?: string;
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  landmark?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  addresses: IAddress[];
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profilePicture?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    marketing: {
      email: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  name: {
    type: String,
    required: false,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || v === '' || /^[6-9]\d{9}$/.test(v);
      },
      message: 'Phone number must be a valid 10-digit Indian mobile number'
    }
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[1-9][0-9]{5}$/.test(v);
      },
      message: 'Pincode must be a valid 6-digit number'
    }
  },
  isDefault: {
    type: Boolean,
    required: true
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    required: true
  },
  landmark: {
    type: String,
    required: false
  }
});

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: false,
    unique: false,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Phone number must be a valid 10-digit Indian mobile number'
    }
  },
  addresses: {
    type: [AddressSchema],
    default: []
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  profilePicture: {
    type: String
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    marketing: {
      email: {
        type: Boolean,
        default: false
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ isActive: 1 });
UserSchema.index({ phoneVerified: 1 });

// Clear existing model to force refresh (useful during development)
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model<IUser>('User', UserSchema); 