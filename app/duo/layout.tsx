import "../globals.css";
import { ClientRoot } from "../ClientRoot";
import Image from "next/image";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import NavLinks from "@/components/NavLinks";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CST Customer Mapping Dashboard",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`flex flex-col ${montserrat.className}`}>
        <nav className="w-full bg-[#0C797D] shadow-2xl border-b border-gray-200 fixed top-0 left-0 right-0 z-10 transition-all duration-300 ease-in-out hover:shadow-3xl">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/home">
              <Image
                src="/cst_logo_white.svg"
                alt="CST Logo"
                width={120}
                height={40}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </Link>
            <div className="flex-grow flex justify-center">
              <NavLinks />
            </div>
            <AuthButton />
          </div>
        </nav>
        <main className="flex-grow mt-16 bg-white">
          <div className="container mx-auto px-6 py-8">
            <ClientRoot>{children}</ClientRoot>
          </div>
        </main>
        <footer className="w-full bg-gray-100 py-4">
          <div className="container mx-auto px-6 flex justify-center items-center flex-col">
            <Image
              src="/cst_logo.svg"
              alt="CST Logo"
              width={100}
              height={33}
              className="opacity-70 mb-2"
            />
            <p className="text-sm text-gray-600 font-semibold">
              © 2024 CST LTD. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
