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
    <main className="flex-1 overflow-y-auto">
      <div className="p-8">
        <Header />
        <div className="mt-8">
          <Select />
        </div>
      </div>
    </main>
  );
}
