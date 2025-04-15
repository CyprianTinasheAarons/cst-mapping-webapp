import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.auth.signOut();

  return NextResponse.redirect(`${origin}/`);
}


// https://cst-mapping-webapp.vercel.app/auth/callback
// http://localhost:3000/auth/callback