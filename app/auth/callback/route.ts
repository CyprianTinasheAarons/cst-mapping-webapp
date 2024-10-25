import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/home`);
      } else {
        console.error("Error exchanging code for session:", error);
      }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}
