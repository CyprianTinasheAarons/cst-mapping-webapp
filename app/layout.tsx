import "./globals.css";
import { ClientRoot } from "./ClientRoot";
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`flex flex-col ${montserrat.className}`}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
