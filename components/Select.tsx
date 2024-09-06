"use client";
import { HoverEffect } from "@/components/ui/card-hover-effect";

export function Select() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
  {
    title: "Bitdefender",
    description: "",
    link: "/bitdefender",
  },
  {
    title: "SentinelOne",
    description: "",
    link: "/sentinelone",
  },
  {
    title: "Duo",
    description: "",
    link: "/duo",
  },
  {
    title: "Ingram",
    description: "",
    link: "/ingram",
  },
  {
    title: "Gamma",
    description: "",
    link: "/gamma",
  },
];
