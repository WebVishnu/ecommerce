"use client";

import { config, getPrimaryColor, getPrimaryPhone } from "@/config/company-config";

export default function TopBar() {
  return (
    <div 
      className="w-full text-white text-center text-xs py-2 tracking-wide px-5"
      style={{ backgroundColor: getPrimaryColor() }}
    >
      Free delivery & installation in {config.contact.address.city.toUpperCase()} |{" "}
      <a 
        href={`tel:${getPrimaryPhone()}`} 
        className="underline whitespace-nowrap"
      >
        {" "}
        Call: {getPrimaryPhone()}
      </a>
    </div>
  );
}
