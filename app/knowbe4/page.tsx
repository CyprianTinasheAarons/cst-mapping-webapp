import React from "react";
import { Knowbe4SyncDashboard } from "@/components/knowbe4/sync-dashboard";

export default function KnowBe4Page() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full flex justify-center items-center text-sm flex-col min-h-screen">
        <div className="flex-1 flex justify-center items-center w-full">
          <Knowbe4SyncDashboard />
        </div>
      </div>
    </div>
  );
}
