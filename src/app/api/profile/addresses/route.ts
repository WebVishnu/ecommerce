import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import User, { IAddress } from '@/models/User';
import { connectDB } from '@/lib/mongodb';

// Get all addresses
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const user = (request as any).user;

    return NextResponse.json({
      success: true,
      data: {
        addresses: user.addresses || []
      }
    });

  } catch (error: any) {
    console.error('Get Addresses Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add new address
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const addressData = await request.json();

    // Validate required fields
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.pincode) {
      return NextResponse.json(
        { success: false, message: 'All address fields are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (addressData.phone && addressData.phone !== '' && !/^[6-9]\d{9}$/.test(addressData.phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Validate pincode
    if (!/^[1-9][0-9]{5}$/.test(addressData.pincode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid pincode' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = (request as any).user;

    // Create new address
    const newAddress: IAddress = {
      name: addressData.name.trim(),
      phone: addressData.phone.trim(),
      street: addressData.street.trim(),
      city: addressData.city.trim(),
      state: addressData.state.trim(),
      pincode: addressData.pincode.trim(),
      isDefault: addressData.isDefault || false,
      addressType: addressData.addressType || 'home',
      landmark: addressData.landmark?.trim() || ''
    };

    // If this is the first address or user wants it as default, set it as default
    if (!user.addresses || user.addresses.length === 0 || newAddress.isDefault) {
      // Remove default from other addresses
      if (user.addresses) {
        user.addresses.forEach((addr: IAddress) => addr.isDefault = false);
      }
      newAddress.isDefault = true;
    }

    // Add new address
    if (!user.addresses) {
      user.addresses = [];
    }
    user.addresses.push(newAddress);

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address added successfully',
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
    console.error('Add Address Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update address
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const { addressId, ...addressData } = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.pincode) {
      return NextResponse.json(
        { success: false, message: 'All address fields are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (addressData.phone && addressData.phone !== '' && !/^[6-9]\d{9}$/.test(addressData.phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Validate pincode
    if (!/^[1-9][0-9]{5}$/.test(addressData.pincode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid pincode' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = (request as any).user;

    // Find and update the address
    const addressIndex = user.addresses?.findIndex((addr: IAddress) => addr._id?.toString() === addressId);
    if (addressIndex === -1 || addressIndex === undefined) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      name: addressData.name?.trim() || "",
      phone: addressData.phone?.trim() || "",
      street: addressData.street.trim(),
      city: addressData.city.trim(),
      state: addressData.state.trim(),
      pincode: addressData.pincode.trim(),
      isDefault: addressData.isDefault || false,
      addressType: addressData.addressType || 'home',
      landmark: addressData.landmark?.trim() || ''
    };

    // Handle default address logic
    if (addressData.isDefault) {
      user.addresses.forEach((addr: IAddress, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
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
    console.error('Update Address Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete address
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = (request as any).user;

    // Find the address
    const addressIndex = user.addresses?.findIndex((addr: IAddress) => addr._id?.toString() === addressId);
    if (addressIndex === -1 || addressIndex === undefined) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    // Check if this is the only address
    if (user.addresses.length === 1) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete the only address. Please add another address first.' },
        { status: 400 }
      );
    }

    // Check if this is the default address
    const isDefault = user.addresses[addressIndex].isDefault;

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address, set the first remaining address as default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
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
    console.error('Delete Address Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 