import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if user needs profile completion
export function needsProfileCompletion(user: any): boolean {
  if (!user) return true;
  
  // Check if profile is marked as incomplete
  if (!user.profileCompleted) return true;
  
  // Check if name is missing (even if profileCompleted is true)
  if (!user.name || user.name.trim() === '') return true;
  
  return false;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

// Validate Indian mobile number
export function validateIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
} 