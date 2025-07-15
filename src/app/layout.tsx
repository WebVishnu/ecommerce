import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers';
import TopBar from '@/components/TopBar';
import MainNav from '@/components/MainNav';
import AdminTopNav from '@/components/AdminTopNav';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper';
import Footer from '@/components/Footer';
import RewardsButton from '@/components/RewardsButton';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shivangi Battery - Premium Battery Solutions",
  description: "Your trusted source for high-quality batteries and power solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Providers>
          <AdminTopNav />
          <AdminLayoutWrapper>
            <TopBar />
            <MainNav />
            {children}
            <Footer />
            <RewardsButton />
          </AdminLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
