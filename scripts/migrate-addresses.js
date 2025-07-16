'use strict';
var mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shivangi-battery');

// Define the old User schema (for migration)
var OldUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  role: String,
  isActive: Boolean,
  phoneVerified: Boolean,
  profileCompleted: Boolean
}, { timestamps: true });

var OldUser = mongoose.model('User', OldUserSchema);

// Define the new User schema
var AddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
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
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  landmark: String
});

var NewUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  addresses: [AddressSchema],
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  profilePicture: String,
  role: String,
  isActive: Boolean,
  phoneVerified: Boolean,
  profileCompleted: Boolean,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    marketing: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

var NewUser = mongoose.model('NewUser', NewUserSchema);

async function migrateAddresses() {
  try {
    console.log('Starting address migration...');
    
    // Get all users
    var users = await OldUser.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    var migratedCount = 0;
    var skippedCount = 0;
    
    for (var user of users) {
      try {
        // Check if user already has addresses array
        if (user.addresses && Array.isArray(user.addresses)) {
          console.log(`User ${user.phone} already has addresses array, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Create new user document with migrated data
        var newUserData = {
          ...user.toObject(),
          addresses: []
        };
        
        // Migrate old address to new format if it exists
        if (user.address && (user.address.street || user.address.city || user.address.state || user.address.pincode)) {
          var migratedAddress = {
            name: user.name || 'Default Address',
            phone: user.phone,
            street: user.address.street || '',
            city: user.address.city || '',
            state: user.address.state || '',
            pincode: user.address.pincode || '',
            isDefault: true,
            addressType: 'home',
            landmark: ''
          };
          
          newUserData.addresses = [migratedAddress];
          console.log(`Migrated address for user ${user.phone}:`, migratedAddress);
        }
        
        // Remove old address field
        delete newUserData.address;
        
        // Update the user document
        await OldUser.findByIdAndUpdate(user._id, newUserData);
        
        migratedCount++;
        console.log(`Successfully migrated user ${user.phone}`);
        
      } catch (error) {
        console.error(`Error migrating user ${user.phone}:`, error);
      }
    }
    
    console.log(`\nMigration completed!`);
    console.log(`Migrated: ${migratedCount} users`);
    console.log(`Skipped: ${skippedCount} users`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateAddresses(); 