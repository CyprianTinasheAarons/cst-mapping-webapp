import React from "react";
import { SyncDashboard } from "@/components/juro/sync-dashboard";

export default function JuroPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full flex justify-center items-center text-sm flex-col min-h-screen">
        <div className="flex-1 flex justify-center items-center w-full">
          <SyncDashboard />
        </div>
      </div>
    </div>
  );
}
