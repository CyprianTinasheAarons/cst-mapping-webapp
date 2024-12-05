"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  const navItems = [
    "Bitdefender",
    "Sentinelone",
    "Duo",
    "Ingram",
    "Gamma",
    "KnowBe4",
  ];

  return (
    <nav className="flex space-x-4">
      {navItems.map((item) => {
        const href = `/${item.toLowerCase()}`;
        const isActive = pathname === href;
        return (
          <Link
            key={item}
            href={href}
            className={`py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
              isActive
                ? "bg-white text-[#0C797D] hover:bg-gray-100"
                : "text-white hover:bg-[#0A6A6E] hover:text-gray-100"
            }`}
          >
            {item}
          </Link>
        );
      })}
    </nav>
  );
}
