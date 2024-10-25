"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useState, useEffect } from "react";
import { isAuthenticated } from "@/utils/supabase/guard";
import { useRouter } from "next/navigation";

export function ClientRoot({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated(
        new Request(window.location.href)
      );
      if (authenticated) {
        router.push("/home");
      } else {
        router.push("/");
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  if (!authChecked) {
    return null; // or a loading spinner
  }

  return <Provider store={store}>{children}</Provider>;
}
