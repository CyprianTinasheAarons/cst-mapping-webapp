import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./login/submit-button";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/?message=Could not authenticate user");
    }

    return redirect("/home");
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect("/?message=Could not authenticate user");
    }

    return redirect("/?message=Check email to continue sign in process");
  };

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Image
            className="mx-auto h-12 w-auto"
            src="/cst_logo.svg"
            alt="CST Logo"
            width={259}
            height={39}
          />
          <h2 className="mt-6 text-center text-3xl font-bold text-[#0C797D]">
            Customer Mapping
          </h2>
        </div>
        <form className="mt-8 space-y-6 border-4 border-[#0C797D]/80 rounded-md p-4" action="#" method="POST">
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#0C797D] focus:border-[#0C797D] focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#0C797D] focus:border-[#0C797D] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <SubmitButton
              formAction={signIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0C797D] hover:bg-[#0A6A6E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C797D]"
              pendingText="Signing In..."
            >
              Sign In
            </SubmitButton>
          </div>

          {/* <div>
            <SubmitButton
              formAction={signUp}
              className="group relative w-full flex justify-center py-2 px-4 border border-[#0C797D] text-sm font-medium rounded-md text-[#0C797D] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C797D]"
              pendingText="Signing Up..."
            >
              Sign Up
            </SubmitButton>
          </div> */}
        </form>
        {searchParams?.message && (
          <p className="mt-2 text-center text-sm text-[#0C797D] bg-[#E6F3F3] p-2 rounded">
            {searchParams.message}
          </p>
        )}
      </div>
    </div>
  );
}
