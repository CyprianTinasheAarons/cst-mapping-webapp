import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const signOut = async () => {
    "use server";

    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    await supabase.auth.signOut();
    return redirect("/");
  };

  return (
    <div className="flex items-center gap-4 text-white">
      {user.email}
      <form action={signOut}>
        <button className="flex items-center gap-2 bg-[#0A6A6E] hover:bg-[#085457] text-white font-medium rounded-md px-4 py-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C797D]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          Logout
        </button>
      </form>
    </div>
  );
}
