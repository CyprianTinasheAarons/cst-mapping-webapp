import "./globals.css";
import { ClientRoot } from "./ClientRoot";
import Image from "next/image";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

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
      <body>
        <div className="flex h-screen bg-white">
          {/* Sidebar */}
          <aside className="w-64 bg-[#0C797D] shadow-2xl border-r border-gray-200 fixed h-full overflow-y-auto z-10 transition-all duration-300 ease-in-out hover:shadow-3xl">
            <div className="p-6">
              <Link href="/home">
                <Image
                  src="/cst_logo_white.svg"
                  alt="CST Logo"
                  width={120}
                  height={40}
                  className="mb-8 hover:opacity-80 transition-opacity duration-200"
                />
              </Link>
              <nav className="space-y-4">
                {["Bitdefender", "Sentinelone", "Duo", "Ingram", "Gamma"].map(
                  (item) => (
                    <Link
                      key={item}
                      href={`/${item.toLowerCase()}`}
                      className="block py-2 px-4 rounded-lg text-white hover:bg-[#0A6A6E] hover:text-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {item}
                    </Link>
                  )
                )}
              </nav>
            </div>
            <div className="absolute bottom-0 w-full p-6 border-t border-gray-200 bg-[#0C797D]">
              <AuthButton />
            </div>
          </aside>
          <main className="flex-1">
            <ClientRoot>{children}</ClientRoot>
          </main>
        </div>
      </body>
    </html>
  );
}
