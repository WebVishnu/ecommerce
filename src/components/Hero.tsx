"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
export default function Hero() {
  const router = useRouter();
  return (
    <section className="relative bg-[#fff8f0] min-h-[480px] flex items-center justify-center overflow-hidden border-b border-gray-200">
      <div className=" mx-auto w-full flex flex-col md:flex-row items-center justify-between py-16 md:py-24">
        {/* Left: Text */}
        <div className="flex-1 z-10">
          <div className="uppercase text-xs tracking-widest text-[#b91c1c] mb-2 font-semibold">
            Authorised Battery Dealer
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            Powering Homes, Businesses & Vehicles in Atrauli
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Inverter, Automotive, Solar & UPS Batteries from Exide, Amaron,
            Luminous, Livguard, Okaya & more.
          </p>
          <button
            className="px-7 py-2 border border-[#b91c1c] bg-[#b91c1c] text-white rounded text-base font-semibold hover:bg-[#a31b1b] transition"
            onClick={() => router.push("/search")}
          >
            Shop Batteries
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
