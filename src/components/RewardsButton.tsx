'use client';

import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RewardsButton() {
  const { isAdmin } = useAuth();
  if(isAdmin) return null;
  return (
    <a
      href="https://wa.me/919999999999"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-10 flex items-center gap-2 bg-[#128C7E] text-white px-4 py-2 rounded-full shadow-lg text-base font-medium"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
    >
      <MessageCircle className="w-5 h-5" />
      Chat on WhatsApp
    </a>
  );
} 