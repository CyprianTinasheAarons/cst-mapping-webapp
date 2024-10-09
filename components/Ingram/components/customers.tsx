"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComboboxDemo } from "@/components/ui/combobox";
import PaginationComponent from "./pagination";
import { X, RefreshCw, Search } from "lucide-react";
import { useIngramSync } from "./hooks";

const Customers = () => {
  const {
    customerSearch,
    setCustomerSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    isSyncing,
    paginatedCustomers,
    haloCustomerOptions,
    haloClients,
    selectedHaloCustomers,
    handleHaloCustomerSelect,
    handleSyncChanges,
    handleUnsyncChanges,
    totalFilteredCustomers,
  } = useIngramSync();

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search customers"
            className="max-w-2xl"
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
          />

          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingram Customer</TableHead>
            <TableHead>HaloPSA Customer</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCustomers.map((customer) => (
            <TableRow key={customer.customer_ingram_id}>
              <TableCell className="font-medium">
                {customer.ingram_name}
                <div className="text-sm text-muted-foreground">
                  {customer.customer_ingram_id}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {customer.synced ? (
                  <div>
                    {customer.halo_name}
                    <div className="text-sm text-muted-foreground">
                      {customer.customer_halo_id}
                    </div>
                  </div>
                ) : (
                  <ComboboxDemo
                    options={haloCustomerOptions}
                    onSelect={(value) => {
                      console.log("Selected value:", value);
                      const selectedHalo = haloClients.find(
                        (hc) => hc.name == value
                      );
                      console.log("Halo Clients:", haloClients);
                      console.log("Selected Halo customer:", selectedHalo);
                      if (selectedHalo) {
                        console.log("Handling Halo customer select");
                        handleHaloCustomerSelect(
                          customer.id.toString(),
                          selectedHalo.id,
                          selectedHalo.name
                        );
                      }
                    }}
                    placeholder="Halo Customer"
                    selectedValue={selectedHaloCustomers[customer.id]?.id}
                  />
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <div className="flex items-center space-x-4">
                    {customer.synced ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-200 text-black hover:bg-red-100"
                        onClick={() => handleUnsyncChanges(customer.id)}
                        disabled={isSyncing}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Unsync
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-200 text-black hover:bg-blue-100"
                        onClick={() => handleSyncChanges(customer.id)}
                        disabled={
                          !selectedHaloCustomers[customer.id] || isSyncing
                        }
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync
                      </Button>
                    )}
                  </div>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationComponent
        currentPage={currentPage}
        totalItems={totalFilteredCustomers}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Customers;
