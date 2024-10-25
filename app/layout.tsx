"use client";

import "./globals.css";
import { ClientRoot } from "./ClientRoot";
import { Montserrat } from "next/font/google";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
const montserrat = Montserrat({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }
  return (
    <html lang="en">
      <body className={`flex flex-col ${montserrat.className}`}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
