"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export function ClientRoot({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user && pathname !== "/") {
        router.push("/");
      } else if (user && pathname === "/") {
        router.push("/home");
      }
      setIsLoading(false);
    };

    checkUser();
  }, [pathname, router, supabase.auth]);

  if (isLoading) {
    return <div></div>;
  }

  return <Provider store={store}>{children}</Provider>;
}
