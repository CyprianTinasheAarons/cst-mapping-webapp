import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TableForm from "@/components/TableForm.SentinelOne";
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
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full  flex justify-center items-center  text-sm flex-col min-h-screen">
        <div className="flex-1 flex justify-center items-center w-full">
          <TableForm data={mappingData} />
        </div>
      </div>
    </div>
  );
}
