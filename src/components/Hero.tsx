"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { config, getPrimaryColor } from "@/config/company-config";

export default function Hero() {
  const router = useRouter();
  return (
    <section 
      className="relative min-h-[480px] flex items-center justify-center overflow-hidden border-b border-gray-200"
      style={{ backgroundColor: config.branding.colors.background.tertiary }}
    >
      <div className=" mx-auto w-full flex flex-col md:flex-row items-center justify-between py-16 md:py-24">
        {/* Left: Text */}
        <div className="flex-1 z-10">
          <div 
            className="uppercase text-xs tracking-widest mb-2 font-semibold"
            style={{ color: getPrimaryColor() }}
          >
            Authorised Battery Dealer
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            {config.content.hero.title}
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            {config.content.hero.subtitle}
          </p>
          <button
            className="px-7 py-2 border text-white rounded text-base font-semibold transition"
            style={{ 
              backgroundColor: getPrimaryColor(),
              borderColor: getPrimaryColor()
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = config.branding.colors.primary.dark;
              e.currentTarget.style.borderColor = config.branding.colors.primary.dark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = getPrimaryColor();
              e.currentTarget.style.borderColor = getPrimaryColor();
            }}
            onClick={() => router.push("/search")}
          >
            {config.content.hero.cta}
          </button>
        </div>
        {/* Right: Image Collage */}
        <div className="flex-1 flex justify-end items-center mt-12 md:mt-0">
          <div className="w-[340px] min:h-[260px] md:w-[420px] md:h-[320px] bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden relative p-4 gap-2 flex-wrap">
            <Image
              src="https://www.exidecare.com/images/headerLogo.jpg"
              alt="Exide"
              height={100}
              width={150}
              className="h-12 md:h-16 mx-2"
            />
            <Image
              src="https://amaron-prod-images.s3.ap-south-1.amazonaws.com/s3fs-public/Amaron_Logo_0.jpg"
              height={100}
              width={150}
              alt="Amaron"
              className="h-12 md:h-16 mx-2"
            />
            <Image
              src="https://lumprodsta.blob.core.windows.net/prodcontainer/assets/icons/LuminousLogoBlue.webp"
              height={100}
              width={150}
              alt="Luminous"
              className="h-12 md:h-16 mx-2"
            />
            <Image
              src="https://www.livguard.com/static-assets/icons/logo-light.svg"
              alt="Livguard"
              height={100}
              width={150}
              className="h-12 md:h-16 mx-2"
            />
            <Image
              src="https://i0.wp.com/okaya.com/wp-content/uploads/2018/05/okayalogo.png?fit=228%2C60&ssl=1"
              alt="Okaya"
              height={100}
              width={150}
              className="h-12 md:h-16 mx-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
