import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TableForm from "@/components/TableForm";
import Image from "next/image";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const { data: mappingData, error } = await supabase
    .from("mapping")
    .select("*");

  if (error) {
    console.error("Error fetching mapping data:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      <div className="w-full">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-shrink-0 flex items-center">
                <Image className="h-8 w-auto" src="/cst_logo.svg" alt="CST Logo" width={259} height={39} />
              </div>
              <div className="flex items-center">
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <Link href="/home" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-widest">
                    Dashboard
                  </Link>
                  <Link href="/bitdefender" className="border-[#0C797D] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-widest">
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
        <div className="py-6 font-light bg-[#0C797D] text-center text-white text-2xl">
          Bitdefender Customer Mapping
        </div>
      </div>
      <div className="w-full  flex justify-center items-center p-3 text-sm flex-col min-h-screen">
        <div className="flex-1 flex justify-center items-center w-full">
          <TableForm data={mappingData} />
        </div>
      </div>
      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
