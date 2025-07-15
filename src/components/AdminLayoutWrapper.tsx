"use client";

import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const { isAdmin } = useAuth();

  return (
    <div className={isAdmin ? "md:pt-7 pt-12" : ""}>
      {children}
    </div>
  );
} 