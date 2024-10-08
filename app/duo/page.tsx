import React from "react";
import { DuoSyncDashboard } from "@/components/duo/sync-dashboard";

export default function DuoPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full flex justify-center items-center text-sm flex-col min-h-screen">
        <div className="flex-1 flex justify-center items-center w-full">
          <DuoSyncDashboard />
        </div>
      </div>
    </div>
  );
}
