"use client";

import { createClient } from "@/utils/supabase/client";

export async function isAuthenticated(request: Request): Promise<boolean> {
  const { pathname } = new URL(request.url);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === "/home") {
    return user !== null;
  }

  if (pathname === "/") {
    return user === null;
  }

  return true;
}
