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
    description:
      "A cybersecurity technology company that provides advanced threat protection solutions.",
    link: "/bitdefender",
  },
  {
    title: "SentinelOne",
    description:
      "A cybersecurity company that offers endpoint protection and response solutions.",
    link: "/sentinelone",
  },
];
