import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TableForm from "@/components/TableForm";

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
        <div className="py-6 font-bold bg-[#0C797D] text-center text-white">
          This is a protected page that you can only see as an authenticated
          user
        </div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <a
            href="/protected"
            className="w-full max-w-4xl flex justify-between items-end p-3 text-sm"
          >
            <h1 className="font-bold text-lg">Bitdefender Customer Mapping</h1>
            <AuthButton />
          </a>
        </nav>
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
