import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { Select } from "@/components/Select";
import Header from "@/components/Header";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-shrink-0 flex items-center">
                <Image className="h-8 w-auto" src="/cst_logo.svg" alt="CST Logo" width={259} height={39} />
              </div>
              <div className="flex items-center">
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <Link href="/home" className="border-[#0C797D] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-widest">
                    Dashboard
                  </Link>
                  <Link href="/bitdefender" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-widest">
                    Bitdefender
                  </Link>
                  <Link href="/sentinelone" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-widest">
                    Sentinelone
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <AuthButton />
              </div>
            </div>
          </div>
        </nav>
       
      </div>

      <div className="flex-1 flex flex-col gap-2 max-w-4xl px-3">
        <Header />
        <main className="flex-1 flex flex-col gap-6">
          <Select />
        </main>
      </div>
<footer className="w-full bg-[#333333] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <Image src="/cst_logo_white.svg" alt="CST Logo" width={120} height={40} />
            </div>
            <div className="text-sm">
              <p>&copy; 2024 CST Ltd. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
