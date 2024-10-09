"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Customers from "./components/customers";
import Subscriptions from "./components/subscriptions";


export function SyncDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1200px] w-full mx-auto">
          <div className="w-full min-w-[1000px] mx-auto">
            <Tabs defaultValue="customers">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              </TabsList>
              <div className="w-full max-w-[900px] mx-auto">
                <TabsContent value="customers" className="space-y-4">
                  <Customers />
                </TabsContent>
                <TabsContent value="subscriptions" className="space-y-4">
                  <Subscriptions />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
