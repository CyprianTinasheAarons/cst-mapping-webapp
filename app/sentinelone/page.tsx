import React from "react";
import { SentineloneSyncDashboard } from "@/components/sentinelone/sync-dashboard";

export default function SentinelOnePage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full flex justify-center items-center text-sm flex-col min-h-screen">
        <div className="flex-1 flex justify-center items-center w-full">
          <SentineloneSyncDashboard />
        </div>
      </div>
    </div>
  );
}
