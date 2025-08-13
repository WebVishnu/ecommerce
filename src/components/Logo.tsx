"use client";

import { getCompanyName, getPrimaryColor } from "@/config/company-config";

export default function Logo() {
  return (
    <span
      className="px-4 py-1 border border-black text-lg text-black font-semibold tracking-widest bg-white inline-block"
      style={{ 
        letterSpacing: "0.08em",
        borderColor: getPrimaryColor(),
        color: getPrimaryColor()
      }}
    >
      {getCompanyName().toUpperCase()}
    </span>
  );
}
