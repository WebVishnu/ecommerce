import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import User, { IAddress } from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const { 
      name, 
      email, 
      addresses, 
      dateOfBirth, 
      gender, 
      profilePicture,
      preferences 
    } = await request.json();
    
    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name is required and must be at least 2 characters long' }, 
        { status: 400 }
      );
    }

    await connectDB();
    const user = (request as any).user;

    // Update basic profile info
    user.name = name.trim();
    if (email && email.trim()) {
      user.email = email.trim().toLowerCase();
    }
    
    // Update additional profile fields
    if (dateOfBirth) {
      user.dateOfBirth = new Date(dateOfBirth);
    }
    if (gender) {
      user.gender = gender;
    }
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }
    
    // Update addresses if provided
    if (addresses && Array.isArray(addresses)) {
      // Validate addresses
      for (const address of addresses) {
        if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
          return NextResponse.json(
            { success: false, message: 'All address fields are required' }, 
            { status: 400 }
          );
        }
        
        // Validate phone number
        if (!/^[6-9]\d{9}$/.test(address.phone)) {
          return NextResponse.json(
            { success: false, message: 'Invalid phone number in address' }, 
            { status: 400 }
          );
        }
        
        // Validate pincode
        if (!/^[1-9][0-9]{5}$/.test(address.pincode)) {
          return NextResponse.json(
            { success: false, message: 'Invalid pincode in address' }, 
            { status: 400 }
          );
        }
      }
      
      // Ensure only one default address
      const defaultAddresses = addresses.filter(addr => addr.isDefault);
      if (defaultAddresses.length > 1) {
        return NextResponse.json(
          { success: false, message: 'Only one address can be set as default' }, 
          { status: 400 }
        );
      }
      
      // If no default address is set, set the first one as default
      if (defaultAddresses.length === 0 && addresses.length > 0) {
        addresses[0].isDefault = true;
      }
      
      user.addresses = addresses;
    }
    
    // Update preferences if provided
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    // Mark profile as completed
    user.profileCompleted = true;

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          addresses: user.addresses,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profilePicture: user.profilePicture,
          role: user.role,
          phoneVerified: user.phoneVerified,
          profileCompleted: user.profileCompleted,
          preferences: user.preferences
        }
      }
    });

  } catch (error: any) {
    console.error('Profile Update Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const user = (request as any).user;

    return NextResponse.json({ 
      success: true, 
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          addresses: user.addresses || [],
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profilePicture: user.profilePicture,
          role: user.role,
          phoneVerified: user.phoneVerified,
          profileCompleted: user.profileCompleted,
          preferences: user.preferences
        }
      }
    });

  } catch (error: any) {
    console.error('Profile Get Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 