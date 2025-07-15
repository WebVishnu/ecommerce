import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/User';
import { connectDB } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  phone: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string): string {
  return authHeader.replace('Bearer ', '');
}

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
}

export async function authenticateUser(request: NextRequest): Promise<{ user: IUser | null; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { user: null, error: 'Authorization header missing' };
    }
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    if (!payload) {
      return { user: null, error: 'Invalid token' };
    }
    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return { user: null, error: 'User not found or inactive' };
    }
    return { user };
  } catch {
    return { user: null, error: 'Invalid token' };
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const { user, error } = await authenticateUser(request);
  if (error || !user) {
    return NextResponse.json(
      { success: false, message: error || 'Authentication required' },
      { status: 401 }
    );
  }
  (request as AuthenticatedRequest).user = user;
  return null;
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await requireAuth(request);
  if (authResult) return authResult;
  const user = (request as AuthenticatedRequest).user;
  if (user && user.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Admin access required' },
      { status: 403 }
    );
  }
  return null;
} 